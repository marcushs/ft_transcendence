import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from urllib.parse import parse_qs
from asgiref.sync import sync_to_async
from notifications_app.utils.user_utils import get_user_id_by_username
from notifications_app.models import Notification


class NotificationsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        try:
            if self.user.is_anonymous:
                await self.close()
            else:
                self.group_name = f'user_{self.user.id}'
                await self.channel_layer.group_add(self.group_name, self.channel_name)
                await self.accept()
        except Exception as e:
            print('Error: ', e)

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        pass
        
        
    async def new_notification(self, event):
        notification = event['notification']
        
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'notification': notification
        }))
        
        
    async def change_notification_sender(self, event):
        notification = event['notification']
        
        await self.send(text_data=json.dumps({
            'type': 'change_notification_sender',
            'notification': notification
        }))