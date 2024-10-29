from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
import json

connections = {}
connections_lock = asyncio.Lock()

def get_connections():
    print(f'-> ---------------------------->  {connections}')
    return connections

class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        try:
            if self.user.is_anonymous:
                await self.close()
            else:
                self.group_name = f'matchmaking_searching_{str(self.user.id)}'
                await self.channel_layer.group_add(self.group_name, self.channel_name)
                await self.accept()
                print(f'!!!!!!!!!!!!!!!!!!!!!!---------> add user : {self.user.id} to connections list')
                connections[str(self.user.id)] = self
        except Exception as e: 
            print('Error: ', e)

    async def disconnect(self, close_code):
        if str(self.user.id) in connections:
            del connections[str(self.user.id)]
        await self.channel_layer.group_discard(self.group_name, self.channel_name) 

    async def receive(self, text_data):
        pass
    
    async def game_found(self, event):  
        await self.send(text_data=json.dumps(
            {
                'type': event['type'],
                'player_id': str(self.user.id)
            }
        ))
        
    async def already_in_game(self, event):  
        await self.send(text_data=json.dumps(
            {
                'type': event['type'],
                'player_id': str(self.user.id)
            }
        ))