from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
import json

User = get_user_model()
 
class createTournamentView(View):
	def __init__(self):
		super().__init__

	def post(self, request):
		creator = request.user.id
		data = json.loads(request.body.decode('utf-8'))
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


