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

    async def disconnect(self, close_code):
        pass

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data['type']

        if message_type == 'chat_message':
            try:
                message = data['message']
                target_user = await aget_object_or_404(User, username=data['target_user'])
                chatroom = await self.get_or_create_chatroom(author=self.user, target_user=target_user)
                await self.join_room(str(chatroom.group_id))
                await self.channel_layer.group_send(str(chatroom.group_id), {'type': 'chat.message','message': message, 'author': self.user.username})
                await self.save_message(chatroom=chatroom, author=self.user, message=message)
            except Http404:
                return

    async def join_room(self, room):
        await self.channel_layer.group_add(room, self.channel_name)

    async def leave_room(self, room):
        await self.channel_layer.group_discard(room, self.channel_name)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'author': event['author'],
        }))

    @database_sync_to_async
    def get_or_create_chatroom(self, author, target_user):
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

        return chatroom

    @database_sync_to_async
    def save_message(self, chatroom, author, message):
        GroupMessage.objects.create(group=chatroom, author=author, body=message)
