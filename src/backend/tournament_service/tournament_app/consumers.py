import json
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
			await self.send_success_message(message_type, result)
			await self.channel_layer.group_send('tournament_updates',
												{'type': 'create.tournament',
												'tournament': await tournament.to_dict()})

	async def create_tournament(self, event):
		await self.send(text_data=json.dumps({
			'type': 'create_tournament',
			'tournament': event['tournament']
		}))

	@database_sync_to_async
	def createTournamentInDB(self, data):
		creator = self.user
		print(creator) 
		tournament_name = data['tournament_name']
		tournament_size = data['tournament_size']

		if isinstance(creator, AnonymousUser):
			return None, 'No user found'
		if tournament_name is None or self.is_valid_name(tournament_name) is False:
			return None, 'Invalid tournament name'
		if tournament_size is None or self.is_valid_size(int(tournament_size)) is False:
			return None, 'Invalid tournament size'
		if Tournament.objects.filter(tournament_name=tournament_name).exists():
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

	async def send_success_message(self, type, message):
		await self.send(text_data=json.dumps({
			'type': type,
			'status': 'success',
			'message': message,
		}))
