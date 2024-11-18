from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from django.db.models import Count, Q
from asgiref.sync import async_to_sync

User = get_user_model()

class getMatchByIdView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		if isinstance(request.user, AnonymousUser):
			return JsonResponse({'message': 'unknownUser'}, status=400)
		match_id = request.GET.get('match_id')

		try:
			match = TournamentMatch.objects.get(match_id=match_id)
			return JsonResponse({'status': 'success', 'match': match.to_dict_sync()}, status=200)
			# return JsonResponse({'status': 'success',}, status=200) 
		except TournamentMatch.DoesNotExist:
			return JsonResponse({'status': 'error', 'message': 'Match not found'}, status=400)   
