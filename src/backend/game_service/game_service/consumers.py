from channels.generic.websocket import AsyncWebsocketConsumer
from game_app.game_manager import PongGameEngine
from urllib.parse import parse_qs
import json
import redis

redis_instance = redis.Redis(host='redis', port=6379, db=0)

class GameConsumer(AsyncWebsocketConsumer):
	async def connect(self):
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
		if data['type'] == 'player_action':
			parsed_data = get_valid_data_websocket(data=data) 
			if parsed_data:
				game_instance = PongGameEngine.get_active_game(str(data['game_id']))
				if game_instance:
					await game_instance.update_player_position(player_id=parsed_data['player_id'], action=parsed_data['action'])
		
	async def game_ready_to_start(self, event): 
		await self.send(text_data=json.dumps( 
		{
			'type' : event['type'], 
			'game_id': event['game_id'],
			'game_state': event['game_state'], 
   			'map_dimension': event['map_dimension']
		}
	))
  
	async def data_update(self, event):
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'game_state': event['data']
		}
	))
  
	async def game_finished(self, event):
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'winner': event['winner']
		}
	))
  
def get_valid_data_websocket(data):
	if 'player_id' not in data or 'game_id' not in data:
		return None
	if 'action' not in data:
		return None
	action = str(data['action'])
	if action != 'move_up' and action != 'move_down': 
		return None
	action_info = {
		'player_id': str(data['player_id']),
		'action': action
	}
	return action_info