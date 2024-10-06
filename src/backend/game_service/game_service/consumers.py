from channels.generic.websocket import AsyncWebsocketConsumer
from urllib.parse import parse_qs
import json


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print('---------> websocket connection received')
        query_string = parse_qs(self.scope['query_string'].decode())
        self.user_id = str(query_string.get('user_id', [None])[0])
        try:
            if not self.user_id:
                await self.close()
            else:
                self.group_name = f'game_{self.user_id}'
                await self.channel_layer.group_add(self.group_name, self.channel_name) 
                await self.accept()
        except Exception as e:
            print('Error: ', e)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(f'------ game service receive = {data} ---------------') 