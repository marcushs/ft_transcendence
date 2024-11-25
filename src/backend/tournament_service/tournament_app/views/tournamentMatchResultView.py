from ..utils.weboscket_utils import send_websocket_info
from .tournament_proceed import tournament_proceed_manager
from .tournament_leave import tournament_lost_manager
from django.core.exceptions import ObjectDoesNotExist
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync
from django.http import JsonResponse
from django.views import View
from ..models import *
import json

User = get_user_model()
 
@method_decorator(csrf_exempt, name='dispatch') 
class tournamentMatchResultView(View): 
    def __init__(self):
        super().__init__

    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))

            match = TournamentMatch.objects.get(match_id=str(data['game_id']))
            winner = User.objects.get(id=str(data['winner']['id']))
            loser = User.objects.get(id=str(data['loser']['id'])) 

            match.winner = winner
            match.winner_score = data['winner']['score']

            loser.status = 'lost_match'
            loser.save()
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

            async_to_sync(tournament_proceed_manager)(payload_winner)
            async_to_sync(tournament_lost_manager)(payload_loser)

            return JsonResponse({'status': 'success'}, status=200) 
        except ObjectDoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Match not found'}, status=400)
        except Exception as e:
            print(f'Error: {str(e)}')
            return JsonResponse({"message": str(e)}, status=400)


