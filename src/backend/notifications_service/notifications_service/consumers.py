import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from urllib.parse import parse_qs

class NotificationsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_params = parse_qs(self.scope["query_string"].decode())
        self.user = self.scope["user"]
        try:
            if self.user.is_anonymous:
                await self.close()
            else:
                self.group_name = f'user_{self.user.id}'
                await self.channel_layer.group_add(self.group_name, self.channel_name)
                await self.accept()
        except Exception as e:
            print('------------------- ERROR : ', e, ' -------------------------')

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        query_params = parse_qs(self.scope["query_string"].decode())

        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        
        channel_layer = get_channel_layer()

        await channel_layer.group_send(
            self.group_name,
            {
                'type': 'notification_message',
                'message': f'id is {self.user.id}'
            }
        )
        
        
    async def notification_message(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({
            'message': message
        }))