from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import MatchHistory, User
from django.views import View
import json


@method_decorator(csrf_exempt, name='dispatch') 
class MatchResultManager(View):
    def __init__(self):
        super()

    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            if not self.is_valid_data(data):
                raise(Exception('Invalid matchmaking result')) 
            self.update_match_result_data(data)
            return JsonResponse({'status': 'success', 'message': 'match data updated'}, status=200)
        except Exception as e:
            print(f'-----------> ERROR: {str(e)}')
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


    def is_valid_data(self, data):
        if 'winner' not in data or 'loser' not in data:
            return False
        winner = data['winner']
        loser = data['loser']
        if not (isinstance(winner, dict) and 'id' in winner and 'score' in winner):
            return False
        if not (isinstance(loser, dict) and 'id' in loser and 'score' in loser):
            return False
        if not 'type' in data:
            return False
        for field in ['unranked', 'ranked', 'tournament']:
            if field == data['type']:
                return True
        return False


    def update_match_result_data(self, data):
        winner, loser = self.get_users_from_result(data)
        change_user_games_count(is_game_win=True, user=winner)
        change_user_games_count(is_game_win=False, user=loser)
        create_new_match_history(data=data, winner_instance=winner, loser_instance=loser)
        if data['type'] == 'ranked':
            pass # do the additional manage of point for ranked games here
        winner.save()
        loser.save()


    def get_users_from_result(self, data):
        winner = User.objects.get(id=data['winner']['id'])
        loser = User.objects.get(id=data['loser']['id'])
        return winner, loser


def change_user_games_count(is_game_win, user):
    if is_game_win:
        user.gamesWin += 1
    else:
        user.gamesLoose += 1


def create_new_match_history(data, winner_instance, loser_instance):
    MatchHistory.objects.create(
        winner=winner_instance,
        loser=loser_instance,
        winner_score=int(data['winner']['score']),
        loser_score=int(data['loser']['score']),
        match_type=str(data['type'])
    )