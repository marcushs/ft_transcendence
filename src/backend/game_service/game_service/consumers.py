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
		try:
			data = json.loads(text_data)
			print(f'data received: {data}')
			self.check_received_id(data)
			match str(data['type']):
				case 'player_action':
					await self.handle_player_action(data)
				case 'client_surrended':
					await self.handle_player_surrender()
				case 'client_disconnected':
					await self.handle_player_disconnect()
				case 'client_reconnected':
					await self.handle_player_reconnect()
				case _:
					return
		except Exception as e:
			await self.send(text_data=json.dumps({
				'type': 'error_log',
				'message': f'websocket error: {str(e)}'
			}))


	def check_received_id(self, data):
		if not 'type' in data:
			raise Exception('No type provided')
		if not ('player_id' in data or data['player_id'].isdigit()):
			raise Exception('invalid player ID')
		if not 'game_id' in data:
			raise Exception('game ID does not match any current game')
		self.player_id = int(data['player_id'])
		self.game_id = str(data['game_id'])
		self.game_instance = PongGameEngine.get_active_game(str(data['game_id']))
		if not self.game_instance:
			raise Exception('invalid game ID')


	async def handle_player_action(self, data):  
		if not 'action' in data :
			raise Exception('no action received')
		action = str(data['action'])
		if action != 'move_up' and action != 'move_down':
			raise Exception('invalid action received')
		await self.game_instance.update_player_position(player_id=self.player_id, action=action)


	async def handle_player_surrender(self):
		if self.player_id != self.user_id:
			raise Exception('player ID does not match the user')
		if not (self.game_instance.player_is_in_game(self.player_id)):
			raise Exception('player is not in the game')
		self.game_instance.player_surrender(self.player_id)

	async def handle_player_reconnect(self):
		if self.player_id != self.user_id:
			raise Exception('player ID does not match the user')
		if not (self.game_instance.player_is_in_game(self.player_id)):
			raise Exception('player is not in the game')
		self.game_instance.handle_player_reconnect(self.player_id)
   
   
	async def handle_player_disconnect(self):
		if self.player_id != self.user_id:
			raise Exception('player ID does not match the user')
		if not (self.game_instance.player_is_in_game(self.player_id)):
			raise Exception('player is not in the game')
		self.game_instance.handle_player_disconnect(self.player_id)

 #//---------------------------------------> Sender <--------------------------------------\\#

	# Sender for start game client
	async def game_ready_to_start(self, event): 
		await self.send(text_data=json.dumps( 
		{
			'type' : event['type'], 
			'game_id': event['game_id'],
			'game_state': event['game_state'], 
   			'map_dimension': event['map_dimension']
		}
	))

	# Sender for updating game client
	async def data_update(self, event):
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'game_state': event['data']
		}
	))

	# Sender for inform client game info has changed
	async def game_update_info(self, event):
		await self.send(text_data=json.dumps({
			'type': event['event'],
			'message': event['message']
		}
	))
  
  
	# Sender for websocket error message
	async def error_log(self, event):
		await self.send(text_data=json.dumps({
			'type': event['event'],
			'message': event['message']
		}
	))