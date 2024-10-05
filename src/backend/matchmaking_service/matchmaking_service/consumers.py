import json
from channels.generic.websocket import AsyncWebsocketConsumer


class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        try:
            self.group_name = f'matchmaking_game_connection'
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        except Exception as e:
            print('Error: ', e)

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        pass
    
    async def send_match_pair(self, event):
        print(f'----------- SEND MATCH PAIR  {event}----------')  
        self.send(text_data = json.dumps({
            'game_type' : event['game_type'],
            'player1': event['player1'],
            'player2': event['player2']
        }))