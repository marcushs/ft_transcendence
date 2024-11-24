from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async, async_to_sync
from django.contrib.auth.models import AnonymousUser
from .utils.request import send_request_with_headers
from .create_tournament import createTournamentInDB
from .find_player_match import find_player_match
from django.shortcuts import aget_object_or_404
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from .init_bracket import init_bracket
from django.db import transaction
from django.http import Http404
from .db_utils import *
from .models import *

import json
import asyncio

User = get_user_model()

connections = {}
connections_lock = asyncio.Lock()

match_countdown_tasks = {}
lock = asyncio.Lock()

leave_countdown_tasks = {}
leave_lock = asyncio.Lock()

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
					return await self.send_error_message(data['type'], 'Tournament is already over')
				if await get_members_count(tournament) < tournament.tournament_size:
					if await add_user_to_tournament(tournament, self.user) == 'User already in tournament':
						return await self.send_error_message(data['type'], 'User already in tournament')
					payload = {'type': 'redirect_to_waiting_room', 'tournament': await tournament.to_dict()}
					await self.channel_layer.group_send(group_names[str(self.user.id)], payload)
					payload = {'type': 'join.tournament', 'tournament': await tournament.to_dict()}
					await self.broadcast_message(payload=payload)
					if await get_members_count(tournament) == tournament.tournament_size:
						await set_tournament_not_joinable(tournament)
						tournament_bracket = await init_bracket(tournament)
						members = await sync_to_async(tournament.get_members)()
						for member in members:
							await self.channel_layer.group_send(group_names[member['id']],
																{'type': 'add_players_to_match_group',
																'tournament_bracket': await tournament_bracket.to_dict()
																})
				else:
					await self.send_error_message(data['type'], 'Tournament is full')
			except Http404:
				await self.send_error_message(data['type'], 'Cannot find requested tournament') 

	async def join_tournament(self, event):
		await self.send(text_data=json.dumps({  
			'type': 'join_tournament',
			'tournament': event['tournament'],
		}))

	async def add_players_to_match_group(self, event):
		match_id = await find_player_match(event, self.user)
		player_ids = await get_player_ids_for_match(match_id)
		await self.start_match_countdown(match_id=match_id, player_ids=player_ids)
		match = await sync_to_async(TournamentMatch.objects.get)(match_id=match_id)
		payload = {'type': 'load_match', 'match': await match.to_dict(), 'from_match': False}
		await self.channel_layer.group_send(group_names[str(player_ids[0])], payload) 
		await self.channel_layer.group_send(group_names[str(player_ids[1])], payload)
		
	async def load_match(self, event):
		await self.send(text_data=json.dumps({
			'type': 'load_match',
			'match': event['match'],
			'fromMatch': event['from_match']
		}))

	async def redirect_to_waiting_room(self, event):
		await self.send(text_data=json.dumps({
			'type': 'redirect_to_waiting_room',
			'tournament': event['tournament']
		}))

# -------------------------------> Handle Leave Tournament <---------------------------------

	async def handle_leave_tournament(self, data):
		try:
			tournament = await aget_object_or_404(Tournament, tournament_id=data['tournament_id']) 
			if await is_user_in_this_tournament(tournament, self.user):
				if data['from_match'] == False:
					payload = {'type': 'leave.tournament', 'tournament': await tournament.to_dict()}
					await self.broadcast_message(payload=payload)
				await self.exit_tournament(tournament)
			else:
				await self.send_error_message(data['type'], 'You are not in this tournament')
		except Http404:
			await self.send_error_message(data['type'], 'Cannot find requested tournament')

	async def leave_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type': 'leave_tournament',
			'tournament': event['tournament'], 
		}))

	async def exit_tournament(self, tournament):
		await self.channel_layer.group_send(group_names[str(self.user.id)], {'type': 'redirect_to_tournament_home'})
		await remove_user_from_tournament(tournament, self.user)
		member_count = await get_members_count(tournament)
		print(f'user: {self.user.id} removed from tournament members ... remaining members: {member_count}')
		if member_count == 0:
			return await delete_tournament_when_empty(tournament)  
		await self.stop_leave_countdown()


	async def redirect_to_tournament_home(self, event):
		await self.send(text_data=json.dumps({'type': 'redirect_to_tournament_home'}))  


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
			await self.stop_match_countdown(match_id)
			await self.send_game_instance_request(payload)
			return
		elif result == 'Match not found':
			return await self.send_error_message(data['type'], result)
		elif result == 'Player not in this match':
			return await self.send_error_message(data['type'], result)

# -------------------------------> Handle Proceed Tournament <---------------------------------

	async def proceed_tournament(self, event):
		await self.handle_proceed_tournament(event)

	async def handle_proceed_tournament(self, data):
		try:
			last_match = data['match']
			player = await aget_object_or_404(User, id=data['user_id'])
			tournament = await aget_object_or_404(Tournament, tournament_id=last_match['tournament_id'])
			if tournament.isOver == True:
				return async_to_sync(self.send_error_message)('next_round', 'Tournament is over')
			tournament_bracket = await sync_to_async(lambda: Bracket.objects.filter(tournament=tournament).first())()  
			if tournament_bracket is None:
				return async_to_sync(self.send_error_message)('next_round', 'Bracket not found')
			await self.match_in_next_round(player, last_match, tournament_bracket)
		except Http404:
			await self.send_error_message(data['type'], 'Error in finding last match or user')


	async def send_game_instance_request(self,event):
		payload = { 
			'game_type': 'tournament',
			'match_id': event['match_id'], 
			'player1': event['player1'],  
			'player2': event['player2']
		}
		await self.channel_layer.group_send(group_names[event['player1']], {'type': 'start_game_instance', 'payload': payload})
		await self.channel_layer.group_send(group_names[event['player2']], {'type': 'start_game_instance', 'payload': payload})
		await send_request_with_headers(request_type='POST', 
						url='http://matchmaking:8000/api/matchmaking/matchmaking_tournament/', 
						headers=self.headers, 
						cookies=self.cookies, 
						payload=payload)
			
	async def start_game_instance(self, event):
		await self.send(text_data=json.dumps({ 
			'type': 'start_game_instance', 
			'payload': event['payload']
		})) 

	@database_sync_to_async
	def match_in_next_round(self, user, last_match, tournament_bracket):
		last_round = last_match['tournament_round']
		if last_round == 'finals':
			tournament_bracket_dict = tournament_bracket.to_dict_sync()
			tournament_bracket_dict['alias'] = user.alias
			user.status = 'won_tournament'
			user.save()
			payload = {'type': 'redirect_to_winner_page', 'tournament_bracket': tournament_bracket_dict,}
			return async_to_sync(self.channel_layer.group_send)(group_names[str(user.id)], payload)

		round_mapping = {
			'finals': {'target': tournament_bracket.finals, 'matches_per_side': 0},
			'semi_finals': {'target': tournament_bracket.semi_finals, 'matches_per_side': 1},
			'quarter_finals': {'target': tournament_bracket.quarter_finals, 'matches_per_side': 2},
			'eighth_finals': {'target': tournament_bracket.eighth_finals, 'matches_per_side': 4}
		}
		
		next_rounds = {
			'eighth_finals': 'quarter_finals',
			'quarter_finals': 'semi_finals' ,
			'semi_finals': 'finals'
		}

		last_round_matches = round_mapping[last_round]
		next_round = next_rounds[last_round]
		last_match_index = last_match['bracket_index']
		adjacent_match_index = last_match_index + 1 if last_match_index % 2 == 0 else last_match_index - 1

		if last_round_matches['matches_per_side'] > 1: 
			async_to_sync(self.join_or_create_next_match)(tournament_bracket, next_round, last_match_index, adjacent_match_index, user) 
		elif last_round_matches['matches_per_side'] == 1:
			async_to_sync(self.join_or_create_next_match)(tournament_bracket, next_round, last_match_index, adjacent_match_index, user)

	@database_sync_to_async
	def join_or_create_next_match(self, tournament_bracket, next_round, last_match_index, adjacent_match_index, user):
		round_mapping = {
			'finals': tournament_bracket.finals,
			'semi_finals': tournament_bracket.semi_finals,
			'quarter_finals': tournament_bracket.quarter_finals, 
			'eighth_finals': tournament_bracket.eighth_finals
		}
		if next_round == 'finals':
			with transaction.atomic():
				final_match, created = round_mapping[next_round].get_or_create(
					defaults={
						'tournament': tournament_bracket.tournament,
						'tournament_round': next_round,
						'bracket_index': 0
					} 
				)
				player_count = TournamentMatchPlayer.objects.filter(match=final_match).count()
				if player_count < 2:
					TournamentMatchPlayer.objects.create(
						match=final_match, 
						player=user,
						player_number=TournamentMatchPlayer.PlayerNumber.ONE if last_match_index % 2 == 0 else TournamentMatchPlayer.PlayerNumber.TWO
					)
					payload = {'type': 'load_match', 'match': final_match.to_dict_sync(), 'from_match': True}
					async_to_sync(self.channel_layer.group_send)(group_names[str(user.id)], payload)
					if TournamentMatchPlayer.objects.filter(match=final_match).count() == 2:
						player_ids = list(TournamentMatchPlayer.objects.filter(match_id=final_match.match_id).values_list('player_id', flat=True))
						payload = {'type': 'load_match', 'match': final_match.to_dict_sync(), 'from_match': True}
						async_to_sync(self.channel_layer.group_send)(group_names[str(player_ids[0])], payload)
						async_to_sync(self.channel_layer.group_send)(group_names[str(player_ids[1])], payload)
						async_to_sync(self.start_match_countdown)(match_id=str(final_match.match_id), player_ids=player_ids)
						return final_match
				else:
					# Handle the case where the match is already full
					return None
			return final_match
 
		next_match_index_map = {
			1: 0,
			5: 1,
			9: 2,
			13: 3
		}

		matches_index_sum = last_match_index + adjacent_match_index
		next_match_index = next_match_index_map[matches_index_sum]
		with transaction.atomic():
			next_match, created = round_mapping[next_round].get_or_create(
				bracket_index=next_match_index,
				defaults={
					'tournament': tournament_bracket.tournament,
					'tournament_round': next_round,
				}
			)
			
			# Check if the match is not full before adding the player
			player_count = TournamentMatchPlayer.objects.filter(match=next_match).count()
			if player_count < 2:
				TournamentMatchPlayer.objects.create(
						match=next_match,
						player=user,
						player_number=TournamentMatchPlayer.PlayerNumber.ONE if last_match_index % 2 == 0 else TournamentMatchPlayer.PlayerNumber.TWO
					)
				payload = {'type': 'load_match', 'match': final_match.to_dict_sync(), 'from_match': True}
				async_to_sync(self.channel_layer.group_send)(group_names[str(user.id)], payload)
				if TournamentMatchPlayer.objects.filter(match=next_match).count() == 2:
					player_ids = list(TournamentMatchPlayer.objects.filter(match_id=next_match.match_id).values_list('player_id', flat=True))
					payload = {'type': 'load_match', 'match': final_match.to_dict_sync(), 'from_match': True}
					async_to_sync(self.channel_layer.group_send)(group_names[str(player_ids[0])], payload)
					async_to_sync(self.channel_layer.group_send)(group_names[str(player_ids[1])], payload)
					async_to_sync(self.start_match_countdown)(match_id=str(next_match.match_id), player_ids=player_ids) 
					return next_match
			else:
				# Handle the case where the match is already full
				return None
		return next_match
	
	async def redirect_to_winner_page(self, event):
		await self.send(text_data=json.dumps({
			'type': 'redirect_to_winner_page',
			'tournament_bracket': event['tournament_bracket']  
		}))
		async with connections_lock:
			if str(self.user.id) in connections:
				print(f'user: {self.user.id} active in connections list, starting leave_countdown')
				await self.start_leave_countdown(event['tournament_bracket']['tournament']['tournament_id']) 
			else:
				print(f'user: {self.user.id} not active in connections list, exiting tournament')
				tournament = await sync_to_async(Tournament.objects.get)(tournament_id=event['match']['tournament_id'])
				await self.exit_tournament(tournament)



	# -------------------------------> Handle Start Leave Countdown <--------------------------------- 
	async def handle_start_leave_countdown(self, data):
		exists = await sync_to_async(Tournament.objects.filter(tournament_id=data['tournament_id'], isOver=False).exists)()
		if exists:
			return await self.start_leave_countdown(data['tournament_id'])
		await self.send_error_message(data['type'], 'Invalid tournament Id')


	async def redirect_to_tournament_lost(self, event):
		await self.send(text_data=json.dumps({
			'type': 'redirect_to_tournament_lost', 
			'match': event['match']
		}))
		async with connections_lock:
			if str(self.user.id) in connections:
				print(f'user: {self.user.id} active in connections list, starting leave_countdown')
				await self.start_leave_countdown(event['match']['tournament_id'])
			else:
				print(f'user: {self.user.id} not active in connections list, exiting tournament')
				tournament = await sync_to_async(Tournament.objects.get)(tournament_id=event['match']['tournament_id'])
				await self.exit_tournament(tournament)
       

	# -------------------------------> Countdown functions <---------------------------------

	async def start_match_countdown(self, match_id, player_ids):
		async with lock: 
			if match_id in match_countdown_tasks:
				task = match_countdown_tasks[match_id]
				if task.done():
					del match_countdown_tasks[match_id]
				else:
					return
			match_countdown_tasks[match_id] = asyncio.create_task(self.run_match_countdown(match_id, player_ids))

	async def run_match_countdown(self, match_id, player_ids):
		try:
			countdown = 60
			while True:
				if countdown < 0:
					payload = {
						'match_id': match_id,
						'player1': str(player_ids[0]),  
						'player2': str(player_ids[1])
					}
					await self.send_game_instance_request(payload)
					await self.stop_match_countdown(match_id)
					break
				payload = {'type': 'countdown_update', 'time': countdown, 'sent_from': group_names[str(self.user.id)]}
				await self.channel_layer.group_send(group_names[str(player_ids[0])], payload)
				await self.channel_layer.group_send(group_names[str(player_ids[1])], payload)

				countdown -= 1
				await asyncio.sleep(1)
		except Exception as e:
			print(f'Error: {str(e)}') 
		finally:
			async with lock:
				if match_id in match_countdown_tasks:
					del match_countdown_tasks[match_id]
   

	async def stop_match_countdown(self, match_id):
		try:
			task = match_countdown_tasks.get(match_id) 
			if task:
				task.cancel()
				try:
					await task
				except asyncio.CancelledError:
					pass
		except Exception as e:
			print(f"Error: {str(e)}")
		finally:
			async with lock:
				if match_id in match_countdown_tasks:
					del match_countdown_tasks[match_id] 
      



	# Leave countdown
	async def start_leave_countdown(self, tournament_id):
		async with leave_lock: 
			if self.user.id in leave_countdown_tasks:
				task = leave_countdown_tasks[self.user.id]
				if task.done():
					del leave_countdown_tasks[self.user.id]
				else:
					return
			leave_countdown_tasks[self.user.id] = asyncio.create_task(self.run_leave_countdown(tournament_id)) 
		

	async def run_leave_countdown(self, tournament_id):
		countdown = 67
		while True:
			
			if countdown < 0:
				tournament = await sync_to_async(Tournament.objects.get)(tournament_id=tournament_id)
				await self.exit_tournament(tournament)
				await self.stop_leave_countdown()
				break
			 
			payload = {'type': 'countdown_update', 'time': countdown, 'sent_from': group_names[str(self.user.id)]}

			await self.channel_layer.group_send(group_names[str(self.user.id)], payload) 
			
			countdown -= 1
			await asyncio.sleep(1)

	async def stop_leave_countdown(self):
		try:
			task = leave_countdown_tasks.get(self.user.id) 
			if task:
				task.cancel()
				try:
					await task
				except asyncio.CancelledError:
					pass
		except Exception as e:
			print(f"Error: {str(e)}")
		finally:
			async with leave_lock:
				if self.user.id in leave_countdown_tasks:
					del leave_countdown_tasks[self.user.id] 

	async def countdown_update(self, event):
		await self.send(text_data=json.dumps({
			'type': 'countdown_update',
			'time': event['time'],
			'sent_from': event['sent_from']
		})) 


	# -------------------------------> Utils methods <---------------------------------

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

	@database_sync_to_async
	def get_updated_user(self):
		updated_user = User.objects.get(id=self.user.id)
		self.user = updated_user
