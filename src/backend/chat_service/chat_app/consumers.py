import json
from django.contrib.auth.models import AnonymousUser
from django.shortcuts import aget_object_or_404
from django.http import Http404
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
        message = data['message']

        try:
            target_user = await aget_object_or_404(User, username=data['target_user'])
            print(message)
            print(target_user)
        except Http404:
            return

        # if message_type == 'private_message':
        #     await self.handle_private_message(data)
        # elif message_type == 'join_room':
        #     await self.join_room(data['room'])

    async def handle_private_message(self, data):
        target_user = data['target_user']
        message = data['message']
        room_name = self.get_room_name(self.user.id, target_user)
        
        await self.channel_layer.group_send(
            room_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': self.user.username,
            }
        )

    async def join_room(self, room):
        await self.channel_layer.group_add(room, self.channel_name)

    async def leave_room(self, room):
        await self.channel_layer.group_discard(room, self.channel_name)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'sender': event['sender'],
        }))

    @database_sync_to_async
    def get_or_create_chat_room(self, author, target_user):
        chatroom, created = ChatGroup.objects.get_or_create(
            is_private=True,
            members__in=[author, target_user]
        )

        if created is True:
            chatroom.members.add(author, target_user)

    # @database_sync_to_async
    # def save_message(self, chat_room, sender, message):
    #     Message.objects.create(chat_room=chat_room, sender=sender, content=message)
