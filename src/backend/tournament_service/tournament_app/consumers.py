import json
import random
import math
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import aget_object_or_404
from django.http import Http404
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from .models import *
import shortuuid
import asyncio
from django.db import transaction
from channels.db import database_sync_to_async
from .utils.request import send_request
from asgiref.sync import sync_to_async

User = get_user_model()

class TournamentConsumer(AsyncWebsocketConsumer):
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.countdown_tasks = {}  # Store countdown tasks for each match

	async def connect(self):
		self.user = self.scope['user']
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
			await self.accept()
			await self.channel_layer.group_add('tournament_updates', self.channel_name)

	async def disconnect(self, close_code):
		pass
 
	# Receive message from WebSocket
	async def receive(self, text_data):  
		data = json.loads(text_data)
		message_type = data['type']

		if message_type == 'create_tournament': 
			tournament, result = await self.createTournamentInDB(data)
			if result != 'Tournament created successfully':
				return await self.send_error_message(message_type, result)
			await self.send_success_message(message_type, result, tournament)
			await self.channel_layer.group_add(str(tournament.tournament_id), self.channel_name)
			await self.channel_layer.group_send('tournament_updates',
												{'type': 'new.tournament',
												'tournament': await tournament.to_dict()}) 
		elif message_type == 'join_tournament':
			try:
				tournament = await aget_object_or_404(Tournament, tournament_id=data['tournament_id'])
				if await self.get_members_count(tournament) < tournament.tournament_size:
					if await self.add_user_to_tournament(tournament) == 'User already in tournament':
						return await self.send_error_message(message_type, 'User already in tournament')
					await self.channel_layer.group_add(str(tournament.tournament_id), self.channel_name)  
					await self.send(text_data=json.dumps({
						'type': 'redirect_to_waiting_room',
						'tournament': await tournament.to_dict()
					}))
					await self.channel_layer.group_send('tournament_updates',
										 				{'type': 'join.tournament',
														'tournament': await tournament.to_dict()})
					if await self.get_members_count(tournament) == tournament.tournament_size:
						tournament_bracket = await self.init_bracket(tournament)
						await self.channel_layer.group_send(str(tournament.tournament_id),
															{'type': 'add_players_to_match_group',
															'tournament_stage': await tournament.get_current_stage(),
															'tournament_bracket': await tournament_bracket.to_dict()										  
															})
						await self.channel_layer.group_send(str(tournament.tournament_id), 
															{'type': 'load_match',
															'tournament': await tournament.to_dict(),
															'tournament_bracket': await tournament_bracket.to_dict()}) 
				else:
					await self.send_error_message(message_type, 'Tournament is full')
			except Http404:
				await self.send_error_message(message_type, 'Cannot find requested tournament')
		elif message_type == 'leave_tournament':
			try:
				tournament = await aget_object_or_404(Tournament, tournament_id=data['tournament_id']) 
				if await self.is_user_in_this_tournament(tournament):
					await self.remove_user_from_tournament(tournament)
					await self.channel_layer.group_discard(str(tournament.tournament_id), self.channel_name)
					await self.send(text_data=json.dumps({'type': 'redirect_to_tournament_home'}))
					await self.channel_layer.group_send('tournament_updates', 
														{'type': 'leave.tournament',
			   											'tournament': await tournament.to_dict()})
				else:
					await self.send_error_message(message_type, 'You are not in this tournament')
			except Http404:
				await self.send_error_message(message_type, 'Cannot find requested tournament')
		elif message_type == 'user_ready_for_match':
			result = await self.set_player_ready(data['matchId'])
			if result == 'start game':
				return await self.channel_layer.group_send(data['matchId'], {
					'type': 'launch.game',
					'match_id': data['matchId']
				})
			elif result == 'Match not found':
				return await self.send_error_message(message_type, result)
			pass
		elif message_type == 'start_game':
			await self.channel_layer.group_send(data['matchId'], { 
				'type': 'launch.game',
				'match_id': data['matchId'] 
			})


# -------------------------------> Channel layer event handlers <---------------------------------

	async def new_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type': 'new_tournament',
			'tournament': event['tournament']
		}))

	async def join_tournament(self, event):
		await self.send(text_data=json.dumps({  
			'type': 'join_tournament',
			'tournament': event['tournament'],
		}))

	async def load_match(self, event):
		await self.send(text_data=json.dumps({
			'type': 'load_match',
			'tournament': event['tournament'],
			'tournament_bracket': event['tournament_bracket']
		}))

	async def leave_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type': 'leave_tournament',
			'tournament': event['tournament'], 
		}))
	
	async def add_players_to_match_group(self, event):
		match_id = await self.find_player_match(event)
		await self.channel_layer.group_add(match_id, self.channel_name)
		print(f'add {self.user.id} to channel group ${match_id}')
		await self.start_countdown(match_id)

	async def launch_game(self, event):
		if 'player1' not in event and 'player2' not in event:
			match = await sync_to_async(TournamentMatch.objects.get)(match_id=event['match_id'])
			players = await sync_to_async(match.get_players)()
			event['player1'] = players[0]['id']
			event['player2'] = players[1]['id']
		await self.stop_countdown(event['match_id'])
		await self.start_game_instance(event)

	async def countdown_update(self, event):
		await self.send(text_data=json.dumps({  
			'type': 'countdown_update',
			'time': event['time'],  
		}))

# -------------------------------> Countdown function <---------------------------------

	async def start_countdown(self, match_id):
		match = await sync_to_async(TournamentMatch.objects.get)(match_id=match_id) 
		players = await sync_to_async(match.get_players)()
		if str(self.user.id) == players[0]['id']:  
			if match_id in self.countdown_tasks:
				self.countdown_tasks[match_id].cancel()
            # Create a new task for the countdown
			self.countdown_tasks[match_id] = asyncio.create_task(self.run_countdown(match_id, players))


	async def run_countdown(self, match_id, players):
		countdown = 60 
		try:
			while countdown >= 0:
				await self.channel_layer.group_send(
					match_id,
					{
						"type": "countdown.update",
						"time": countdown
					}
				)
				await asyncio.sleep(1)
				countdown -= 1
 
			# Countdown finished, start the game 
			await self.channel_layer.group_send(
				match_id,
				{
					"type": "launch.game",
					'match_id': match_id,
					'player1': players[0]['id'], 
					'player2': players[1]['id']
				}
			)
		except asyncio.CancelledError:
			pass
		finally:
			# Remove the task from the dictionary
			self.countdown_tasks.pop(match_id, None) 

	async def stop_countdown(self, match_id):
		if match_id in self.countdown_tasks:
			self.countdown_tasks[match_id].cancel() 

# -------------------------------> Create Tournament Utils <---------------------------------

	@database_sync_to_async
	def createTournamentInDB(self, data):
		creator = self.user
		tournament_name = data['tournament_name']
		tournament_size = data['tournament_size'] 

		if isinstance(creator, AnonymousUser): 
			return None, 'No user found'
		if self.is_user_in_any_tournament():
			return None, 'User already in tournament'
		if tournament_name is None or self.is_valid_name(tournament_name) is False:
			return None, 'Invalid tournament name'
		if tournament_size is None or self.is_valid_size(int(tournament_size)) is False:
			return None, 'Invalid tournament size' 
		if Tournament.objects.filter(tournament_name=tournament_name).filter(isOver=False).exists():
			return None, 'Tournament already exists'
		
		round_str = ['finals', 'semi_finals', 'quarter_finals', 'eighth-finals']
		round_str_idx = int(math.log2(int(tournament_size))) - 1

		new_tournament = Tournament.objects.create(creator=creator, tournament_name=tournament_name, tournament_size=tournament_size, current_stage=round_str[round_str_idx])
		new_tournament.members.add(creator)
		return new_tournament, 'Tournament created successfully'
	 

	def is_valid_size(self, size):
		return size in {4, 8, 16} 
	
	def is_valid_name(self, name):
		if name == '' or len(name) > 30:
			return False
		return True

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
	
	async def start_game_instance(self,event):
		await self.unset_user_ready()
		payload = { 
			'game_type': 'tournament',
			'match_id': event['match_id'], 
			'player1': event['player1'], 
			'player2': event['player2'] 
		}
		await self.send(text_data=json.dumps({ 
			'type': 'start_game_instance', 
			'payload': payload 
		})) 
		if str(self.user.id) == event['player1']:
			await send_request(request_type='POST', 
							url='http://matchmaking:8000/api/matchmaking/matchmaking_tournament/', 
							headers=self.headers, 
							cookies=self.cookies, 
							payload=payload)



# -------------------------------> Bracket Utils <---------------------------------

	@database_sync_to_async
	def init_bracket(self, tournament):
		members_copy = tournament.get_members().copy()
		random.shuffle(members_copy)

		nb_of_players = tournament.members.count()
		round = tournament.current_stage

		tournament_bracket = Bracket.objects.create(tournament=tournament)
		round_mapping = {
			'finals': tournament_bracket.finals,
			'semi_finals': tournament_bracket.semi_finals,
			'quarter_finals': tournament_bracket.quarter_finals,
			'eighth_finals': tournament_bracket.eighth_finals
		}

		i = 0
		while i < nb_of_players:
			match = TournamentMatch.objects.create(tournament=tournament, tournament_round=round)
			match.players.add(members_copy[i]['id'])
			match.players.add(members_copy[i + 1]['id'])
			round_mapping[round].add(match)
			i += 2

		return tournament_bracket
	

# -------------------------------> Check database utils <---------------------------------

	@database_sync_to_async
	def set_player_ready(self, match_id):
		try:
			with transaction.atomic():
				match = TournamentMatch.objects.get(match_id=match_id)
				
				# Check if the current user is part of the match
				if not match.players.filter(id=self.user.id).exists():
					return 'Player not in this match'
				
				# Set the current user as ready
				self.user.ready_for_match = True
				self.user.save()
				
				# Get all players for this match
				players = list(match.players.all())
				
				# Check if both players are ready
				if len(players) == 2 and all(player.ready_for_match for player in players):
					return 'start game'
				
				return 'Player ready'

		except ObjectDoesNotExist:
			return 'Match not found'

	@database_sync_to_async
	def add_user_to_tournament(self, tournament):
		if self.is_user_in_any_tournament() == False:
			return tournament.members.add(self.user)
		return 'User already in tournament'
	
	@database_sync_to_async
	def get_members_count(self, tournament):
		return tournament.members.count()

	@database_sync_to_async
	def is_user_in_this_tournament(self, tournament):
		return tournament.members.filter(id=self.user.id).exists()
	
	@database_sync_to_async
	def remove_user_from_tournament(self, tournament):
		return tournament.members.remove(self.user)

	def is_user_in_any_tournament(self):
		return self.user.joined_tournaments.exists() 
	
	@database_sync_to_async
	def user_in_match(self, match):
		return match.players.filter(id=self.user.id).exists()
	
	@database_sync_to_async
	def unset_user_ready(self):
		self.user.ready_for_match = False
		self.user.save()
 
	@database_sync_to_async
	def find_player_match(self, event):
		try:
			tournament_bracket = event['tournament_bracket']
			tournament_stage = event['tournament_stage']
			# for key, value in tournament_bracket.items(): 
			# 	print(f"{key}: {value}")
 
			round_mapping = {
				'finals': tournament_bracket['finals'],
				'semi_finals': tournament_bracket['semi_finals'],
				'quarter_finals': tournament_bracket['quarter_finals'],
				'eighth_finals': tournament_bracket['eighth_finals']
			}

			if tournament_stage not in round_mapping:
				raise ValueError(f"Invalid tournament stage: {tournament_stage}") 

			matches = round_mapping[tournament_stage]
			
			# Find the match where the current user is a player
			user_match = next((match for match in matches 
					if any(player['id'] == str(self.user.id) for player in match['players'])),  
					None)
			
			if user_match:
				return user_match['match_id']
			else:
				print(f"No match found for user {self.user.id} in stage {tournament_stage}") 
				return None

		except ObjectDoesNotExist: 
			print(f"Tournament bracket not found for event: {event}")  
			return None
		except KeyError as e:
			print(f"Missing key in event: {e}")
			return None
		except Exception as e:
			print(f"An error occurred: {e}") 
			return None

	 