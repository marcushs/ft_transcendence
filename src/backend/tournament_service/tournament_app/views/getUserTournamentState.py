from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from ..db_utils import *

User = get_user_model()

class getUserTournamentState(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		try:
			user = request.user

			if isinstance(user, AnonymousUser):
				return JsonResponse({'error': 'User not found'}, status=401)

			if is_user_in_any_tournament(user) == False:
				return JsonResponse({'isInTournament': False}, status=200)
			return JsonResponse({'isInTournament': True}, status=200)

		except Exception:
			return JsonResponse({'isInTournament': False}, status=200)
