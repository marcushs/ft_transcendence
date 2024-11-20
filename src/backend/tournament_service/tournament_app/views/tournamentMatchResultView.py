from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from ..utils.weboscket_utils import send_websocket_info
from asgiref.sync import async_to_sync
import json

User = get_user_model()
 
@method_decorator(csrf_exempt, name='dispatch') 
class tournamentMatchResultView(View): 
	def __init__(self):
		super().__init__

	def post(self, request):
		data = json.loads(request.body.decode('utf-8'))

		try:
			match = TournamentMatch.objects.get(match_id=data['game_id'])
			winner = User.objects.get(id=data['winner']['id'])
			loser = User.objects.get(id=data['loser']['id']) 

			match.winner = winner
			match.winner_score = data['winner']['score']

			loser.status = 'lost_match'
			match.loser = loser
			match.loser_score = data['loser']['score']
			match.isOver = True
			match.save()
			payload_winner = {
				'type': 'proceed_tournament',
				'user_id': str(winner.id),
				'match': match.to_dict_sync()
			}
			payload_loser = {
				'type': 'redirect_to_tournament_lost',
				'user_id': str(loser.id),
				'match': match.to_dict_sync()
			}

			async_to_sync(send_websocket_info)(player_id=winner.id, payload=payload_winner)
			async_to_sync(send_websocket_info)(player_id=loser.id, payload=payload_loser)

			return JsonResponse({'status': 'success'}, status=200) 
		except ObjectDoesNotExist:
			return JsonResponse({'status': 'error', 'message': 'Match not found'}, status=400)
  

