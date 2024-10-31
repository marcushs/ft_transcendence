import json
from django.contrib.auth.models import AnonymousUser
from django.shortcuts import aget_object_or_404
from django.utils import timezone
from django.http import Http404
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
		pass
