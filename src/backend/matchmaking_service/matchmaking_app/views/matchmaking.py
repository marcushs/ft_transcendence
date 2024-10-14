from django.contrib.auth.models import AnonymousUser
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from ..models import MatchHistory
from django.views import View
import random
import queue
import json

User = get_user_model()

unranked_queue = queue.Queue() # global for share unranked players waiting for game
ranked_queue = queue.Queue() # global for share ranked players waiting for game

 #//---------------------------------------> matchmaking endpoint <--------------------------------------\\#

# --------> Add new player to matchmaking waiting queue <-------------- #

class MatchmakingQueueManager(View):  
    def __init__(self):
        super()


    def post(self, request):
        if isinstance(request.user, AnonymousUser):  
            return JsonResponse({'status':'error', 'message': 'No connected user'}, status=200)
        data = json.loads(request.body.decode('utf-8'))
        if not self.is_valid_matchmaking_type(data=data):
            return JsonResponse({'status': 'error', 'message': 'Invalid matchmaking type'}, status=400)
        self.start_matchmaking_by_type(data['type'], request)
        return JsonResponse({'status': 'success', 'message': f'User successfully added to {data['type']} queue'}, status=200) 


    def is_valid_matchmaking_type(self, data):
        if not 'type' in data:
            return False
        for field in ['unranked', 'ranked', 'tournament']:
            if field == data['type']:
                return True 
        return False

    def start_matchmaking_by_type(self, game_type, request):
        matchmaking_dict = {
            'unranked': self.add_player_to_unranked_queue,
            'ranked': self.add_player_to_ranked_queue, 
        }
        
        matchmaking_dict[game_type](request)
        
        
    def add_player_to_unranked_queue(self, request):
        print('--------- UNRANKED ---------')
        unranked_queue.put(request.user)
        
        
        
    def add_player_to_ranked_queue(self, request):
        arr = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        random.shuffle(arr)
        ranked_queue.put(request.user) 
        print(f'--------- RANKED = {arr} ---------')


# --------> Handle result of matchmaking game done <-------------- #

@method_decorator(csrf_exempt, name='dispatch')
class MatchmakingResultManager(View):
    def __init__(self):
        super()

    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            if not self.is_valid_data(data):
                raise(Exception('Invalid matchmaking result'))
            self.update_match_result_data(data)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': e})
        
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
        winner, loser = self.get_user_from_result(self, data)
        change_is_ingame_state(value=False, user_instance=winner)
        change_is_ingame_state(value=False, user_instance=loser)
        change_user_games_count(is_game_win=True, user_instance=winner)
        change_user_games_count(is_game_win=False, user_instance=loser)
        create_new_match_history(data=data, winner_instance=winner, loser_instance=loser)
        
        if data['type'] == 'ranked':
            pass # do the additional manage of point for ranked games here
        
        
    def get_user_from_result(self, data):
        winner = User.objects.get(id=int(data['winner_id']))
        loser = User.objects.get(id=int(data['loser_id']))
        return winner, loser

 #//---------------------------------------> matchmaking utils <--------------------------------------\\#

def change_is_ingame_state(value, user_instance=None, user_id=None):
    if user_id:
        try:
            user = User.objects.get(id=user_id)
        except Exception as e:
            print(f'Error : {e}')
            return
    else:
        user = user_instance
        
    user.is_ingame = value
    user.save()

  
def change_user_games_count(is_game_win, user_instance=None, user_id=None):
    if user_id:
        try:
            user = User.objects.get(id=user_id)
        except Exception as e:
            print(f'Error : {e}')
            return
    else:
        user = user_instance
    if is_game_win:
        user.gamesWin += 1
    else:
        user.gamesLoose += 1
    user.save()


def create_new_match_history(data, winner_instance, loser_instance):
    MatchHistory.objects.create(
        winner=winner_instance,
        loser=loser_instance,
        winner_score=int(data['winner']['score']),
        loser_score=int(data['loser']['score']),
        match_type=str(data['type'])
    )