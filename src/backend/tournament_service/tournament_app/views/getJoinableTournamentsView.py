from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.contrib.auth.models import AnonymousUser
import json
from django.db.models import Count, F, Q
from django.core.serializers import serialize


User = get_user_model()
 
class getJoinableTournamentsView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		joinable_tournaments = Tournament.objects.annotate(
			member_count=Count('members')
		).filter(
			Q(member_count__lt=F('tournament_size')) & Q(isJoinable=True)
		).values('tournament_id', 'tournament_name', 'tournament_size', 'member_count')

		tournaments_list = list(joinable_tournaments)
		return JsonResponse({'tournaments_list': tournaments_list, 'status': 'success'}, status=200)


