import json
from django.contrib.auth.models import AnonymousUser
from django.shortcuts import aget_object_or_404
from django.http import Http404
from django.db.models import Count, Q
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import *

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if isinstance(self.user, AnonymousUser):
            await self.close()
        else:
            await self.accept()
            await self.channel_layer.group_add('chatgroup_updates', self.channel_name)

    async def disconnect(self, close_code):
        pass

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data['type']

        if message_type == 'chat_message':
            try:
                target_user = await aget_object_or_404(User, id=data['target_user'])
                chatroom, created = await self.get_or_create_chatroom(author=self.user, target_user=target_user)
                if created is True:
                    await self.channel_layer.group_send('chatgroup_updates', 
                                                        {'type': 'chatgroup.update', 
                                                         'chatroom': str(chatroom.group_id), 
                                                         'target_user': str(target_user.id)})
                    await self.join_room(str(chatroom.group_id))
                message = await self.save_message(chatroom=chatroom, author=self.user, message=message)
                await self.channel_layer.group_send(str(chatroom.group_id), 
                                                    {'type': 'chat.message', 
                                                     'chatroom': str(chatroom.group_id), 
                                                     'message': message.body, 
                                                     'author': self.user.username, 
                                                     'timestamp': message.created})
            except Http404:
                return
        elif message_type == 'join_room':
            chatroom_id = data['chatroom_id']
            await self.join_room(chatroom_id)

            # Retrieve and send recent messages
            recent_messages = await self.get_recent_messages(chatroom_id)
            for message in recent_messages:
                await self.send(text_data=json.dumps({
                    'type': 'chat_message',
                    'chatroom': chatroom_id,
                    'message': message.body,
                    'timestamp': message.created,
                    'author': await self.get_message_author_username(message)
                }))

    async def join_room(self, chatroom):
        await self.channel_layer.group_add(chatroom, self.channel_name)

    async def leave_room(self, chatroom):
        await self.channel_layer.group_discard(chatroom, self.channel_name)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'chatroom': event['chatroom'],
            'message': event['message'],
            'author': event['author'],
        }))

    async def chatgroup_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chatgroup_update',
            'chatroom': event['chatroom'],
            'target_user': event['target_user'],
        }))

    @database_sync_to_async
    def get_or_create_chatroom(self, author, target_user):
        created = False

        try:
            chatroom = ChatGroup.objects.filter(
                is_private=True
            ).annotate(
                author_count=Count('members', filter=Q(members=author)),
                target_count=Count('members', filter=Q(members=target_user)),
                member_count=Count('members')
            ).filter(
                author_count=1,
                target_count=1,
                member_count=2
            ).get()
        except ChatGroup.DoesNotExist:
            chatroom = ChatGroup.objects.create()
            chatroom.members.add(author, target_user)
            created = True

        return chatroom, created
    
    @database_sync_to_async
    def save_message(self, chatroom, author, message):
        return GroupMessage.objects.create(group=chatroom, author=author, body=message)

    @database_sync_to_async
    def get_recent_messages(self, chatroom_id):
        return list(GroupMessage.objects.filter(group_id=chatroom_id)[:10])
    
    @database_sync_to_async
    def get_message_author_username(self, message):
        return message.author.username

