import json
from django.contrib.auth.models import AnonymousUser
from django.shortcuts import aget_object_or_404
from django.utils import timezone
from django.http import Http404
from django.db.models import Count, Q
from django.core.serializers.json import DjangoJSONEncoder
from django.core.exceptions import MultipleObjectsReturned
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import *
from django.utils import timezone
from datetime import timedelta

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if isinstance(self.user, AnonymousUser):
            await self.close()
        else:
            await self.accept()
            self.groups = set()
            await self.channel_layer.group_add('chatgroup_updates', self.channel_name)
            self.groups.add('chatgroup_updates')
            await self.join_all_old_rooms()

    async def disconnect(self, close_code):
        for group in self.groups:
            await self.channel_layer.group_discard(
                group,
                self.channel_name
            )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data['type']

        if message_type == 'chat_message':
            try:
                message_body = data['message']
                target_user = await aget_object_or_404(User, id=data['target_user'])
                if target_user == self.user:
                    return 
                chatroom, created = await self.get_or_create_chatroom(author=self.user, target_user=target_user)
                if created is True:
                    await self.channel_layer.group_send('chatgroup_updates',
                                                        {'type': 'chatgroup.update',
                                                         'chatroom': str(chatroom.group_id),
                                                         'target_user': str(target_user.id)})
                    await self.join_room(str(chatroom.group_id))

                if len(message_body) > 300: 
                    return await self.send(text_data=json.dumps({'type': 'chat_error', 'message': 'messageTooLong'}))
                if await sync_to_async(target_user.is_blocking)(self.user):
                    saved_message = await self.save_message(chatroom=chatroom, author=self.user, message=message_body, blocked=True)
                else: 
                    saved_message = await self.save_message(chatroom=chatroom, author=self.user, message=message_body, blocked=False)
                await self.channel_layer.group_send(str(chatroom.group_id),
                                                    {'type': 'chat.message',
                                                     'chatroom': str(chatroom.group_id),
                                                     'message': saved_message.body,
                                                     'author': str(self.user.id),
                                                     'timestamp': self.format_datetime(saved_message.created)})
            except Http404:
                return
        elif message_type == 'join_new_room':
            chatroom_id = data['chatroom_id']
            await self.join_room(chatroom_id)

            # Retrieve and send recent messages
            recent_messages = await self.get_recent_messages(chatroom_id)
            for message in recent_messages:
                await self.send(text_data=json.dumps({
                    'type': 'chat_message',
                    'chatroom': chatroom_id,
                    'message': message.body,
                    'timestamp': self.format_datetime(message.created),
                    'author': str(await self.get_message_author_id(message))
                }))
        elif message_type == 'join_old_room':
            chatroom_id = data['chatroom_id']
            await self.join_room(chatroom_id)

        elif message_type == 'remove_room':
            chatroom = await self.find_matching_room(data['target_user_id'])
            if chatroom is not None:
                await self.channel_layer.group_send(str(chatroom.group_id), {
                    'type': "remove_room",
                    'chatroom': str(chatroom.group_id),
                })

    async def join_all_old_rooms(self):
        chatrooms = await self.get_all_chatrooms()
        for chatroom in chatrooms:
            await self.join_room(str(chatroom.group_id))

    async def join_room(self, chatroom):
        self.groups.add(chatroom)
        await self.channel_layer.group_add(chatroom, self.channel_name)

    async def leave_room(self, chatroom):
        self.groups.discard(chatroom)
        await self.channel_layer.group_discard(chatroom, self.channel_name)

    async def chat_message(self, event):
        author = event['author']

        if await self.is_user_blocked(author) == True:
            return
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'chatroom': event['chatroom'],
            'message': event['message'],
            'author': author,
            'timestamp': event['timestamp'] 
        }))

    async def chatgroup_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chatgroup_update',
            'chatroom': event['chatroom'],
            'target_user': event['target_user'],
        }))

    async def remove_room(self, event):
        chatroom = event['chatroom']
        await self.send(text_data=json.dumps({
            'type': 'remove_room',
            'chatroom': chatroom
        }))

    def format_datetime(self, timestamp):
        now = timezone.localtime(timezone.now())    
        today_midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday_midnight = today_midnight - timedelta(days=1)

        if timestamp >= today_midnight:
            # Today, display hour and minute
            return timestamp.strftime("%H:%M")
        elif yesterday_midnight <= timestamp < today_midnight:
            # Yesterday
            return 'Yesterday'
        else:
            # Before yesterday, display date
            return timestamp.strftime('%d/%m/%Y')

    @database_sync_to_async
    def get_or_create_chatroom(self, author, target_user):
        if author == target_user:
            return
            
        created = False

        try:
            chatroom = ChatGroup.objects.filter(
					members__in=[author, target_user]
				).annotate(
					num_members=Count('members')
				).filter(
					num_members=2
				).get()
        except MultipleObjectsReturned:
            chatroom = ChatGroup.objects.filter(
					members__in=[author, target_user]
				).annotate(
					num_members=Count('members')
				).filter(
					num_members=2
				).first()
        except ChatGroup.DoesNotExist:
            chatroom = ChatGroup.objects.create()
            chatroom.members.add(author, target_user)
            created = True

        return chatroom, created
    
    @database_sync_to_async
    def save_message(self, chatroom, author, message, blocked):
        return GroupMessage.objects.create(group=chatroom, author=author, body=message, blocked=blocked, created=timezone.localtime(timezone.now()))

    @database_sync_to_async
    def get_recent_messages(self, chatroom_id):
        return list(GroupMessage.objects.filter(group_id=chatroom_id)[:5])
    
    @database_sync_to_async
    def get_message_author_id(self, message):
        return message.author.id
    
    @database_sync_to_async
    def find_matching_room(self, target_user_id):
        try:
            chatroom = ChatGroup.objects.filter(
					members__in=[self.user, target_user_id]
				).annotate(
					num_members=Count('members')
				).filter(
					num_members=2
				).get()
            return chatroom
        except MultipleObjectsReturned:
            chatroom = ChatGroup.objects.filter(
					members__in=[self.user, target_user_id]
				).annotate(
					num_members=Count('members')
				).filter(
					num_members=2
				).first()
            return
        except ChatGroup.DoesNotExist:
            return None
        
    @database_sync_to_async
    def is_user_blocked(self, user_id):
        return self.user.is_blocking(user_id)
    
    @database_sync_to_async
    def get_all_chatrooms(self):
        return list(ChatGroup.objects.filter(members=self.user))
    