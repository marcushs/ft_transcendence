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
		match_id = request.GET.get('match_id')

		try:
			bracket =  Bracket.objects.filter(
				Q(eighth_finals__match_id=match_id) |
				Q(quarter_finals__match_id=match_id) |
				Q(semi_finals__match_id=match_id) | 
				Q(finals__match_id=match_id)  
			).first()
			print(bracket)
			# for key, value in bracket.items():   
			# 	print(f"{key}: {value}")  
			return JsonResponse({'status': 'success', 'bracket': bracket.to_dict_sync()}, status=200)
			# return JsonResponse({'status': 'success',}, status=200) 
		except Bracket.DoesNotExist:
			return JsonResponse({'status': 'error', 'message': 'No bracket found'}, status=400)   
