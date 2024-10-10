from channels.generic.websocket import AsyncWebsocketConsumer
from game_app.game_manager import PongGameEngine, update_players_state
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
		parsed_data = get_valid_data_websocket(data=data)
		print(f'------ game parsed data = {parsed_data} ---------------')
		if not parsed_data:
			return
		if data['type'] == 'player_move':
			update_players_state(data=parsed_data)
		# if data['type'] == 'init_game':
		# 	redis_instance.publish(f"waiting_for_start:{data['game_id']}", json.dumps(parsed_data))
			# print(f"------ init_game redis message published for game_id : {data['game_id']} ---------------")
		
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
  
def get_valid_data_websocket(data):
    if data['type'] == 'init_game':
        if 'width' not in data:
            return None
        if 'height' not in data:
            return None
        map_size = {
        	'width': str(data['width']),
        	'height': str(data['height'])		
		}
        return map_size
    elif data['type'] == 'player_move':
        return True
    else:
        return None