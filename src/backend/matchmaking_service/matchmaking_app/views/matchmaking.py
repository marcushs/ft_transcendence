from django.contrib.auth.models import AnonymousUser
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.http import JsonResponse 
from django.views import View
import random
import queue
import json
import redis

redis_instance = redis.Redis(host='redis', port=6379, db=0)

User = get_user_model()

unranked_queue = queue.Queue() # global for share unranked players waiting for game
ranked_queue = queue.Queue() # global for share ranked players waiting for game

 #//---------------------------------------> matchmaking endpoint <--------------------------------------\\#

# --------> API: Add new player to matchmaking waiting queue <-------------- #

class MatchmakingQueueManager(View):  
    def __init__(self):
        super()


    def post(self, request):
        if isinstance(request.user, AnonymousUser):  
            return JsonResponse({'status':'error', 'message': 'User not connected'}, status=400) 
        data = json.loads(request.body.decode('utf-8'))
        if not self.is_valid_matchmaking_type(data=data):
            return JsonResponse({'status': 'error', 'message': 'Invalid matchmaking type'}, status=400)
        is_waiting, match_type = is_already_in_waiting_list(str(request.user.id))
        if is_waiting:
            return JsonResponse({'status': 'error', 'message': 'User is already in matchmaking research'}, status=200)
        self.start_matchmaking_by_type(data['type'], request)
        return JsonResponse({'status': 'success', 'message': f"User successfully added to {data['type']} queue"}, status=200) 


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
        unranked_queue.put(request.user)
        
        
        
    def add_player_to_ranked_queue(self, request):
        ranked_queue.put(request.user)

# -------->API: Verify presence of user in waiting list <-------------- #

class CheckUserInWaitingQueue(View):
    def __init__(self):
        super()


    def get(self, request):
        if isinstance(request.user, AnonymousUser):  
            return JsonResponse({'message': 'No connected user'}, status=401)
        is_waiting, match_type = is_already_in_waiting_list(str(request.user.id))
        if is_waiting:
            return JsonResponse({'waiting': True, 'match_type': match_type}, status=200) 
        return JsonResponse({'waiting': False}, status=200)

# -------->API: remove user from waiting list <-------------- #

class RemoveUserFromWaitingQueue(View):
    def __init__(self):
        super()


    def post(self, request):
        if isinstance(request.user, AnonymousUser):  
            return JsonResponse({'message': 'No connected user'}, status=401) 
        is_waiting, match_type = is_already_in_waiting_list(str(request.user.id))
        print(f'-> is waitin: return : bool : {is_waiting} -- match_type: {match_type}')
        if not is_waiting:
            return JsonResponse({'message': 'cant remove user from matchmaking research cause he is not already present in it'}, status=401)
        if match_type == 'unranked':
            redis_instance.lrem('unranked_waiting_users', 0, str(request.user.id))
        elif match_type == 'ranked':
            redis_instance.lrem('ranked_waiting_users', 0, str(request.user.id)) 
        return JsonResponse({'message': 'user removed from matchmaking research'}, status=200) 
    
# -------->API - internal: change in_game state <-------------- #

@method_decorator(csrf_exempt, name='dispatch')
class ChangeInGameUserStatus(View): 
    def __init__(self):
        super()


    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            self.check_data(data)
            change_is_ingame_state(value=False, user_id=data['winner_id'])
            change_is_ingame_state(value=False, user_id=data['loser_id'])
            return JsonResponse({}, status=200)        
        except Exception as e:
            print(f'---------> ERROR: {str(e)}')
            return JsonResponse({'message': str(e)}, status=400) 
        
    def check_data(self, data):
        if not 'winner_id' in data or not 'loser_id' in data:
            raise Exception('Missing user_id in data') 

 #//---------------------------------------> matchmaking utils <--------------------------------------\\#

def change_is_ingame_state(value: bool, user_instance=None, user_id=None):
    if user_id:
        try:
            if not isinstance(user_id, str):
                user_id = str(user_id)
            user = User.objects.get(id=user_id)
        except Exception as e:
            print(f'Error : {e}')
            return
    else:
        user = user_instance
        
    user.is_ingame = value 
    user.save()

def is_already_in_waiting_list(target_id: str): 
    unranked_waiting_users = redis_instance.lrange('unranked_waiting_users', 0, -1)
    unranked_waiting_users = [user_id.decode() for user_id in unranked_waiting_users]
    ranked_waiting_users = redis_instance.lrange('ranked_waiting_users', 0, -1)
    ranked_waiting_users = [user_id.decode() for user_id in ranked_waiting_users]
    print(f'-> check: user_id : {target_id} in unranked : {unranked_waiting_users} -- in ranked: {ranked_waiting_users}')
    if target_id in unranked_waiting_users:
        return True, 'unranked'
    if target_id in ranked_waiting_users: 
        return True, 'ranked'
    return False, None


def check_duplicate_user_in_waiting_list(target_user: str):
    unranked_waiting_users = redis_instance.lrange('unranked_waiting_users', 0, -1) 
    unranked_waiting_users = [user_id.decode() for user_id in unranked_waiting_users]
    ranked_waiting_users = redis_instance.lrange('ranked_waiting_users', 0, -1)
    ranked_waiting_users = [user_id.decode() for user_id in ranked_waiting_users]
    if target_user.id in unranked_waiting_users or target_user.id in ranked_waiting_users:  
        return False
    return True