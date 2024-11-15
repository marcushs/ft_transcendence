from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from ..utils.jwt_utils import get_user_from_jwt_sync
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from django.db.models import Count, Q
from asgiref.sync import async_to_sync

User = get_user_model()

class getBracketView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
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
			).first()

			return JsonResponse({'bracket': bracket.to_dict_sync(), 'status': 'success'}, status=200)
		return JsonResponse({'message': 'Bracket not found', 'status': 'error'}, status=404)
