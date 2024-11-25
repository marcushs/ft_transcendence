from channels.generic.websocket import AsyncWebsocketConsumer
from .views.match_countdown import start_match_countdown, stop_match_countdown
from .views.send_game_request import send_game_instance_request
from django.contrib.auth.models import AnonymousUser
from .utils.request import send_request_with_headers
from .create_tournament import createTournamentInDB
from .find_player_match import find_player_match
from django.shortcuts import aget_object_or_404
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from .init_bracket import init_bracket
from django.http import Http404
from .db_utils import *
from .models import *

import json
import asyncio

User = get_user_model()

connections = {}
connections_lock = asyncio.Lock()

group_names = {}

class TournamentConsumer(AsyncWebsocketConsumer):
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)

	async def connect(self):
		self.user = self.scope['user'] 
		try: 
			self.headers = {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'X-CSRFToken': self.scope['cookies'].get('csrftoken')
				}
			self.cookies = {
					'csrftoken': self.scope['cookies'].get('csrftoken'),
					'jwt': self.scope['cookies'].get('jwt'),
					'jwt_refresh': self.scope['cookies'].get('jwt_refresh'),
				}
			if isinstance(self.user, AnonymousUser):
				await self.close()
			else:
				self.group_name = f'tournament_{str(self.user.id)}'
				group_names[str(self.user.id)] = self.group_name
				await self.channel_layer.group_add(self.group_name, self.channel_name) 
				await self.accept()
				async with connections_lock:
					connections[str(self.user.id)] = self
					print(f'user: {self.user.id} added to connections list...') 
		except Exception as e:  
			print(f'Error : {str(e)}')

	async def disconnect(self, close_code):
		async with connections_lock:
			if str(self.user.id) in connections:
				print(f'user: {self.user.id} deleted from connections list...')
				del connections[str(self.user.id)]
		if hasattr(self, 'group_name'):
			await self.channel_layer.group_discard(self.group_name, self.channel_name)

	# Receive message from WebSocket
	async def receive(self, text_data):  
		data = json.loads(text_data)
		message_type = data['type']
		try:
			await self.check_player_availability()
		except Exception as e:
			return await self.send_error_message(message_type, str(e))
	
		await self.get_updated_user()
		if message_type == 'create_tournament': 
			await self.handle_create_tournament(data=data)
		elif message_type == 'join_tournament':
			await self.handle_join_tournament(data=data)
		elif message_type == 'leave_tournament':
			await self.handle_leave_tournament(data=data)
		elif message_type == 'user_ready_for_match': 
			await self.handle_user_ready(data=data)


# -------------------------------> Handle Create Tournament <---------------------------------

	async def handle_create_tournament(self, data):
		tournament, result = await createTournamentInDB(data=data, user=self.user)
		if result != 'Tournament created successfully':
			return await self.send_error_message(data['type'], result)
		await self.send_success_message(data['type'], result, tournament)
		payload = {'type': 'new.tournament', 'tournament': await tournament.to_dict()}
		await self.broadcast_message(payload=payload)

	async def new_tournament(self, event):
		await self.send(text_data=json.dumps({ 
			'type': 'new_tournament',
			'tournament': event['tournament']
		}))



# -------------------------------> Handle Join Tournament <---------------------------------

	async def handle_join_tournament(self, data): 
		try:
			tournament = await aget_object_or_404(Tournament, tournament_id=data['tournament_id'])
			if tournament.isOver == True:
				return await self.send_error_message(data['type'], 'tournamentAlreadyOver')
			if await get_members_count(tournament) < tournament.tournament_size:
				if await add_user_to_tournament(tournament, self.user) == 'User already in tournament':
					return await self.send_error_message(data['type'], 'userAlreadyInTournament')
				payload = {'type': 'redirect_to_waiting_room', 'tournament': await tournament.to_dict()}
				await self.channel_layer.group_send(group_names[str(self.user.id)], payload)
				payload = {'type': 'join.tournament', 'tournament': await tournament.to_dict()}
				await self.broadcast_message(payload=payload)
				if await get_members_count(tournament) == tournament.tournament_size:
					await set_tournament_not_joinable(tournament)
					tournament_bracket = await init_bracket(tournament)
					members = await sync_to_async(tournament.get_members)()
					for member in members:
						await self.channel_layer.group_send(
          					group_names[member['id']],
							{
           						'type': 'add_players_to_match_group',
								'tournament_bracket': await tournament_bracket.to_dict()
							}
       					)
			else:
				await self.send_error_message(data['type'], 'tournamentIsFull')
		except Http404:
			await self.send_error_message(data['type'], 'tournamentNotFound') 

	async def join_tournament(self, event):
		await self.send(text_data=json.dumps({  
			'type': 'join_tournament',
			'tournament': event['tournament'],
		}))

	async def add_players_to_match_group(self, event):
		match_id = await find_player_match(event, self.user)
		player_ids = await get_player_ids_for_match(match_id)
		await start_match_countdown(match_id=match_id, player_ids=player_ids)
		match = await sync_to_async(TournamentMatch.objects.get)(match_id=match_id)
		payload = {'type': 'load_match', 'match': await match.to_dict(), 'from_match': False}
		await self.channel_layer.group_send(group_names[str(player_ids[0])], payload) 
		await self.channel_layer.group_send(group_names[str(player_ids[1])], payload)

# -------------------------------> Handle Leave Tournament <---------------------------------

	async def handle_leave_tournament(self, data):
		from .views.tournament_leave import exit_tournament
     
		try:
			tournament = await aget_object_or_404(Tournament, tournament_id=data['tournament_id']) 
			if await is_user_in_this_tournament(tournament, self.user):
				if data['from_match'] == False:
					payload = {'type': 'leave.tournament', 'tournament': await tournament.to_dict()}
					await self.broadcast_message(payload=payload)
				await exit_tournament(tournament=tournament, user_id=str(self.user.id))
			else:
				await self.send_error_message(data['type'], 'notInTournament')
		except Http404:
			await self.send_error_message(data['type'], 'tournamentNotFound')

	async def leave_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type': 'leave_tournament',
			'tournament': event['tournament'], 
		})) 


	async def redirect_to_tournament_home(self, event):
		await self.send(text_data=json.dumps({
      		'type': event['type']
        	}
        ))  


# -------------------------------> Handle User Ready <---------------------------------

	async def handle_user_ready(self, data):
		match_id = data['matchId']
		result = await set_player_ready(match_id, self.user) 
		if result == 'start game':
			player_ids = await get_player_ids_for_match(match_id)
			payload = {
				'match_id': match_id,
				'player1': str(player_ids[0]), 
				'player2': str(player_ids[1])
			}
			await stop_match_countdown(match_id)
			await send_game_instance_request(payload)
			return
		elif result == 'Match not found':
			return await self.send_error_message(data['type'], 'matchNotFound')
		elif result == 'Player not in this match':
			return await self.send_error_message(data['type'], 'playerNotInMatch')

# -------------------------------> websocket Sender <---------------------------------

	async def load_match(self, event):
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'match': event['match'],
			'fromMatch': event['from_match']
		}))


	async def redirect_to_waiting_room(self, event):
		await self.send(text_data=json.dumps({
			'type': 'redirect_to_waiting_room',
			'tournament': event['tournament']
		})) 

	
	async def start_game_instance(self, event):
		await self.send(text_data=json.dumps({ 
			'type': 'start_game_instance',  
			'payload': event['payload']
		})) 


	async def redirect_to_winner_page(self, event):
		await self.send(text_data=json.dumps({
			'type': event['type'],
			'tournament_bracket': event['tournament_bracket']  
		}))


	async def redirect_to_tournament_lost(self, event):
		await self.send(text_data=json.dumps({
			'type': 'redirect_to_tournament_lost', 
			'match': event['match']
		}))


	async def countdown_update(self, event):
		await self.send(text_data=json.dumps({
			'type': 'countdown_update',
			'time': event['time'],
		})) 


	async def send_external_error_message(self, event):  
		await self.send(text_data=json.dumps(
			{
				'type': event['event'],
				'status': 'error',
				'message': event['message']
			}
		))

 
	async def send_error_message(self, type, message):
		await self.send(text_data=json.dumps({
			'type': type,
			'status': 'error',
			'message': message,
		}))


	async def send_success_message(self, type, message, tournament): 
		await self.send(text_data=json.dumps({
			'type': type,
			'status': 'success',
			'message': message,
			'tournament': await tournament.to_dict()
		}))

	# -------------------------------> Utils methods <---------------------------------

	async def get_cookies_and_headers(self):
		return self.cookies, self.headers


	async def broadcast_message(self, payload):
		for group_name in group_names.values(): 
			await self.channel_layer.group_send(group_name, payload)


	async def check_player_availability(self):
		is_waiting_response = await send_request_with_headers(request_type='GET', url='http://matchmaking:8000/api/matchmaking/is_waiting/', headers=self.headers, cookies=self.cookies)
		if is_waiting_response.json().get('waiting') == True:
			raise Exception('alreadyInGameResearch')
		is_playing_response = await send_request_with_headers(request_type='GET', url='http://matchmaking:8000/api/matchmaking/user_is_in_game/', headers=self.headers, cookies=self.cookies)
		if is_playing_response.json().get('is_in_game') == True:
			raise Exception('alreadyInGame')
		is_playing_response = await send_request_with_headers(request_type='GET', url='http://matchmaking:8000/api/matchmaking/check_private_match/', headers=self.headers, cookies=self.cookies)
		if is_playing_response.json().get('in_private_lobby') == True:
			raise Exception('alreadyInPrivateLobby')


	@database_sync_to_async 
	def get_updated_user(self):
		updated_user = User.objects.get(id=self.user.id)
		self.user = updated_user
