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
from .models import *
from django.utils import timezone
from datetime import timedelta

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
			self.createTournament(data)
			
	@database_sync_to_async
	def createTournament(self, data):
		creator = self.user
		tournament_name = data['tournament_name']
		tournament_size = data['tournament_size']

		if isinstance(creator, AnonymousUser):
			print('test1---------------------------')
			return JsonResponse({'message': 'No user found', 'status': 'error'}, status=400)
		if tournament_name is None or self.is_valid_name(tournament_name) is False:
			print('test2---------------------------')
			return JsonResponse({'message': 'Invalid tournament name', 'status': 'error'}, status=200)
		if tournament_size is None or self.is_valid_size(int(tournament_size)) is False:
			print('test3---------------------------')
			return JsonResponse({'message': 'Invalid tournament size', 'status': 'error'}, status=200)
		if Tournament.objects.filter(tournament_name=tournament_name).exists():
			print('test4---------------------------') 
			return JsonResponse({'message': 'Tournament already exists', 'status': 'error'}, status=200)
		
		new_tournament = Tournament.objects.create(creator=creator, tournament_name=tournament_name, tournament_size=tournament_size)
		new_tournament.members.add(creator)
		return JsonResponse({'message': 'Tournament created successfully', 'status': 'success', 'tournament': new_tournament.to_dict()}, status=200)

	def is_valid_size(self, size):
		return size in {4, 8, 16} 
	
	def is_valid_name(self, name):
		if name == '' or len(name) > 30:
			return False
		return True
