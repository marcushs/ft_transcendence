import json
import random
from django.contrib.auth.models import AnonymousUser
from django.shortcuts import aget_object_or_404
from django.utils import timezone
from django.http import Http404, JsonResponse
from django.db.models import Count, Q
from django.core.serializers.json import DjangoJSONEncoder
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from .models import *
from django.utils import timezone
from datetime import timedelta
import shortuuid

User = get_user_model()

class TournamentConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.user = self.scope['user']
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
						await self.init_bracket(tournament)
						await self.channel_layer.group_send(str(tournament.tournament_id),
															{'type': 'load_match',
															'tournament': await tournament.to_dict()})
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
		}))

	async def leave_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type': 'leave_tournament',
			'tournament': event['tournament'],
		}))

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
		
		new_tournament = Tournament.objects.create(creator=creator, tournament_name=tournament_name, tournament_size=tournament_size)
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
	def init_bracket(self, tournament):
		members_copy = tournament.get_members().copy()
		random.shuffle(members_copy)

		
		match = TournamentMatch.objects.create(match_id=shortuuid.uuid(), tournament=tournament, tournament_round='semi_finals')
		match.players.add(members_copy[0]['id'])
		match.players.add(members_copy[1]['id'])


	# @database_sync_to_async
	# def create_match_pairs(self, members):


	


