from channels.generic.websocket import AsyncWebsocketConsumer
from game_app.game.game_engine import PongGameEngine
from urllib.parse import parse_qs
import json
import asyncio
from channels.layers import get_channel_layer


connections = {}
channel_layer = get_channel_layer()

class GameConsumer(AsyncWebsocketConsumer):

 #//---------------------------------------> Connector <--------------------------------------\\#

	async def connect(self):
		query_string = parse_qs(self.scope['query_string'].decode()) 
		self.user_id = str(query_string.get('user_id', [None])[0])
		try:
			if not self.user_id or self.user_id == 'undefined':  
				await self.close()
			else:
				self.group_name = f'game_{self.user_id}'
				await self.channel_layer.group_add(self.group_name, self.channel_name)
				async with asyncio.Lock():
					print(f'!!!!!!!!!!!!!!!!!!!!!!---------> add user : {self.user_id} to connections list')
					connections[self.user_id] = self 
				await self.accept()
		except Exception as e:
			print('Error: ', e) 

 #//---------------------------------------> Disconnector <--------------------------------------\\#

	async def disconnect(self, close_code):
		async with asyncio.Lock(): 
			if self.user_id in connections:
				del connections[self.user_id]
		if hasattr(self, 'group_name'):
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
				case 'client_disconnected':
					await self.handle_player_disconnect()
				case 'client_reconnected':
					await self.handle_player_reconnect()
				case 'emote_sent':
					await self.handle_emote_sent(data)
				case _:
					raise Exception(f"unrecognized message type : {str(data['type'])}")
		except Exception as e:
			print(f'error: {str(e)}')
			await self.send(text_data=json.dumps({
				'type': 'error_log',
				'message': f'websocket error: {str(e)}'
			}))


	def check_received_id(self, data): 
		if not 'type' in data:
			raise Exception('No type provided')
		if not 'player_id' in data:
			raise Exception('no player ID provided')
		if not 'game_id' in data:
			raise Exception('no game ID provided')
		self.player_id = str(data['player_id'])
		self.game_id = str(data['game_id'])
		print(f'self.player_id: {self.player_id} -- self.game_id')
		self.game_instance = PongGameEngine.get_active_game(str(data['game_id']))
		if not self.game_instance:
			raise Exception('game ID does not match any current game')



	async def handle_player_action(self, data):  
		if not 'action' in data :
			raise Exception('no action received')
		action = str(data['action'])
		if action != 'move_up' and action != 'move_down':
			raise Exception('invalid action received')
		await self.game_instance.update_player_position(player_id=self.player_id, action=action)
  

	async def handle_player_reconnect(self):
		if self.player_id != self.user_id:
			raise Exception('player ID does not match the user')
		if not (self.game_instance.player_is_in_game(self.player_id)):
			raise Exception('player is not in the game')
		await self.game_instance.handle_player_reconnect(self.player_id)
   
   
	async def handle_player_disconnect(self):
		if self.player_id != self.user_id:
			raise Exception('player ID does not match the user')
		if not (self.game_instance.player_is_in_game(self.player_id)):
			raise Exception('player is not in the game')
		await self.game_instance.handle_player_disconnect(self.player_id)
  
	async def handle_emote_sent(self, data):
		if not 'emote_type' in data :
			raise Exception('no emote type provided')
		emote_type = str(data['emote_type'])
		if emote_type != 'happy' and emote_type != 'mad' and emote_type != 'cry' and emote_type != 'laugh':
			raise Exception('invalid emote type received')
		player_id_to_send = PongGameEngine.check_last_emote_timestamp(player_id=self.player_id)

		print('id to send ======================================= ', player_id_to_send)
		await channel_layer.group_send(
            f'game_{player_id_to_send}',
            {
				'type': 'send_emote',
				'emote_type': emote_type
			}
        )
       

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


	# Sender for websocket connections timeout
	async def connections_time_out(self, event):
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'message': 'game connection timeout, game is canceled'
		}
	))
  
  
	# Sender for emotes
	async def send_emote(self, event):
		await self.send(text_data=json.dumps({
			'type': 'emote_received',
            'message': event['emote_type'],
		}
	))