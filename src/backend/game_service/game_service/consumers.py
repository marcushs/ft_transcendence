from channels.generic.websocket import AsyncWebsocketConsumer
from game_app.game.game_engine import PongGameEngine
from urllib.parse import parse_qs
import json

class GameConsumer(AsyncWebsocketConsumer):

 #//---------------------------------------> Connector <--------------------------------------\\#

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

 #//---------------------------------------> Disconnector <--------------------------------------\\#

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(self.group_name, self.channel_name) 

 #//---------------------------------------> Receiver <--------------------------------------\\#

	async def receive(self, text_data):
		data = json.loads(text_data)
		print(f'data received: {data}')
		if data['type'] == 'player_action':
			await self.handle_player_action(data)
		elif data['type'] == 'surrender':
			await self.handle_surrender(data)


	async def handle_player_action(self, data): 
		print('test')
		parsed_data = self.get_valid_action(data=data)
		if parsed_data:
			game_instance = PongGameEngine.get_active_game(str(data['game_id']))
			if game_instance:
				await game_instance.update_player_position(player_id=parsed_data['player_id'], action=parsed_data['action']) 
    

	async def handle_surrender(self, data):
		try:
			player_id = int(data['player_id'])
			if player_id != self.user_id:
				raise Exception('player ID does not match the user')
			game_id = int(data['game_id'])
			game_instance = PongGameEngine.get_active_game(game_id)
			if not (game_instance.player_is_in_game(player_id)):
				raise Exception('player is not in the game')
			game_instance.player_surrender(player_id)
		except Exception as e:
			await self.send(text_data=json.dumps({
				'type': 'error',
				'message': str(e)
			}))


    # Valid and extract data from websocket message
	def get_valid_action(self, data):
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

 #//---------------------------------------> Sender <--------------------------------------\\#

	# Sender for start game in front
	async def game_ready_to_start(self, event): 
		await self.send(text_data=json.dumps( 
		{
			'type' : event['type'], 
			'game_id': event['game_id'],
			'game_state': event['game_state'], 
   			'map_dimension': event['map_dimension']
		}
	))

	# Sender for updating game in front
	async def data_update(self, event):
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'game_state': event['data']
		}
	))

	# Sender for end game in front
	async def game_finished(self, event):
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'winner': event['winner']
		}
	))