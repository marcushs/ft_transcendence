from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.contrib.auth.models import AnonymousUser
import json
from django.db.models import Count, F, Q
from django.core.serializers import serialize


User = get_user_model()
 
class checkUserInTournamentView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		if isinstance(request.user, AnonymousUser):
			return JsonResponse({'message': 'unknownUser'}, status=400)

		if request.user.joined_tournaments.exists():
			return JsonResponse({'isInTournament': True}, status=200)

