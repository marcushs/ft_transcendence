from channels.generic.websocket import AsyncWebsocketConsumer
from matchmaking_app.utils.websocket_utils import handle_waiting_messages
import asyncio
import threading
import json

connections = {}
connections_lock = threading.Lock()

def get_connections():
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
                with connections_lock:
                    connections[str(self.user.id)] = self
                await handle_waiting_messages(str(self.user.id))
        except Exception as e: 
            print(f'Error: {str(e)}')


    async def disconnect(self, close_code):
        with connections_lock:
            if str(self.user.id) in connections:
                del connections[str(self.user.id)]
        if hasattr(self, 'group_name'):
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
        
    async def player_joined_private_match(self, event): 
        await self.send(text_data=json.dumps(
            {
                'type': event['type'],
                'player_id': event['player_id']
            }
        ))
        
    async def player_refused_private_match(self, event):  
        await self.send(text_data=json.dumps(
            {
                'type': event['type'],
                'player_id': event['player_id']
            }
        ))
        
    async def private_match_started(self, event):
        await self.send(text_data=json.dumps(
            {
                'type': event['type'],
            }
        ))
        
    async def private_match_canceled(self, event):  
        await self.send(text_data=json.dumps(
            {
                'type': event['type'],
            }
        ))