import json
from channels.generic.websocket import AsyncWebsocketConsumer


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        try:
            if self.user.is_anonymous:
                await self.close()
            else:
                self.group_name = f'matchmaking_game_connection'
                await self.channel_layer.group_add(self.group_name, self.channel_name)
                await self.accept()
        except Exception as e:
            print('Error: ', e)

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        print(f'------ game service receive = {text_data} ---------------')  
        pass