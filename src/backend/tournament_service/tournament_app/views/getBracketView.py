from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from django.db.models import Count, Q
from asgiref.sync import async_to_sync

User = get_user_model()

class getBracketView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		try:
			user = request.user

			if isinstance(user, AnonymousUser):
				return JsonResponse({'error': 'User not found'}, status=401)

			active_tournament = Tournament.objects.filter(
				members=user,
				isOver=False
			).first()

			if active_tournament:
				bracket = Bracket.objects.filter(tournament=active_tournament).prefetch_related(
					'eighth_finals', 'quarter_finals', 'semi_finals', 'finals'
				).first().to_dict_sync()
				bracket['tournament_size'] = active_tournament.tournament_size

				return JsonResponse({'bracket': bracket, 'status': 'success'}, status=200)
			return JsonResponse({'message': 'Bracket not found', 'status': 'error'}, status=404)
		except Exception as e:
			print(f'Error: {str(e)}')
			return JsonResponse({"message": str(e)}, status=400)
