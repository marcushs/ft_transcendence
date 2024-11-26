from ..utils.user_utils import get_user_by_id, send_request
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AnonymousUser
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async, async_to_sync
from django.http import JsonResponse 
from django.views import View
import queue
import redis
import json

redis_instance = redis.Redis(host='redis', port=6379, db=0)

User = get_user_model()

unranked_queue = queue.Queue() # global for share unranked players waiting for game
ranked_queue = queue.Queue() # global for share ranked players waiting for game

 #//---------------------------------------> matchmaking endpoint <--------------------------------------\\#

@method_decorator(csrf_exempt, name='dispatch')
class MatchmakingTournament(View):  
    def __init__(self):
        super()

    async def post(self, request): 
        try:
            data = json.loads(request.body.decode('utf-8'))
            if not 'player1' in data or not 'player2' in data or not 'game_type' in data:
                return JsonResponse({'status': 'error', 'message': 'Game cant start, invalid data sent'}, status=400)
            players = await sync_to_async(self.get_players_data)(player_one_id=str(data['player1']), player_two_id=str(data['player2']))
            await sync_to_async(change_is_ingame_state)(value=True, user_instance=players[0]) 
            await sync_to_async(change_is_ingame_state)(value=True, user_instance=players[1])
            payload = {
                'game_type': str(data['game_type']),  
                'player1': str(data['player1']),     
                'player2': str(data['player2']),
                'match_id': str(data['match_id'])  
            }
            await send_request(request_type='POST', url='http://game:8000/api/game/start_game/', payload=payload)
            return JsonResponse({'status': 'success', 'message': 'Game instance started'}, status=200)
        except Exception as e: 
            print(f'Error: {str(e)}') 
            await sync_to_async(change_is_ingame_state)(value=False, user_instance=players[0])
            await sync_to_async(change_is_ingame_state)(value=False, user_instance=players[1])
            return JsonResponse({'status': 'error', 'message': 'An error occurred while starting the game'}, status=502)
        
    def get_players_data(self, player_one_id, player_two_id):
        player_one = get_user_by_id(player_one_id)
        player_two = get_user_by_id(player_two_id)
        return (player_one, player_two)

        

# --------> API: Add new player to matchmaking waiting queue <-------------- #

class MatchmakingQueueManager(View):  
    def __init__(self):
        super()


    def post(self, request):
        from .PrivateMatch import is_player_in_private_lobby
        
        try:
            if isinstance(request.user, AnonymousUser):  
                return JsonResponse({'status':'error', 'message': 'User not connected'}, status=401) 
            data = json.loads(request.body.decode('utf-8'))
            if not self.is_valid_matchmaking_type(data=data):
                return JsonResponse({'status': 'error', 'message': 'Invalid matchmaking type'}, status=400)
            is_waiting, match_type = is_already_in_waiting_list(str(request.user.id))
            if is_waiting:
                return JsonResponse({'status': 'error', 'message': 'User is already in matchmaking research'}, status=200)
            if is_player_in_private_lobby(request.user):
                return JsonResponse({'status': 'error', 'message': 'User is already in private match lobby'}, status=200)
            if is_already_in_tournament(request):
                return JsonResponse({'status': 'error', 'message': 'User is already in tournament'}, status=200)
            self.start_matchmaking_by_type(str(data['type']), request) 
            return JsonResponse({'status': 'success', 'message': f"User successfully added to {data['type']} queue"}, status=200) 
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500) 


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
        try:
            if isinstance(request.user, AnonymousUser):  
                return JsonResponse({'message': 'No connected user'}, status=401)
            is_waiting, match_type = is_already_in_waiting_list(str(request.user.id))
            if is_waiting:
                return JsonResponse({'waiting': True, 'match_type': match_type}, status=200) 
            return JsonResponse({'waiting': False}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)  

# -------->API: remove user from waiting list <-------------- #

class RemoveUserFromWaitingQueue(View):
    def __init__(self):
        super()


    def post(self, request):
        try:
            if isinstance(request.user, AnonymousUser):  
                return JsonResponse({'message': 'No connected user'}, status=401) 
            is_waiting, match_type = is_already_in_waiting_list(str(request.user.id))
            if not is_waiting:
                return JsonResponse({'message': 'cant remove user from matchmaking research cause he is not already present in it'}, status=404)
            if match_type == 'unranked':
                redis_instance.lrem('unranked_waiting_users', 0, str(request.user.id))
            elif match_type == 'ranked':
                redis_instance.lrem('ranked_waiting_users', 0, str(request.user.id)) 
            return JsonResponse({'message': 'user removed from matchmaking research'}, status=200) 
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)
    
# -------->API - internal: change in_game state <-------------- #

@method_decorator(csrf_exempt, name='dispatch')
class ChangeInGameUserStatus(View): 
    def __init__(self):
        super()


    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            self.check_data(data)
            change_is_ingame_state(value=False, user_id=str(data['player_one_id']))
            change_is_ingame_state(value=False, user_id=str(data['player_two_id']))
            return JsonResponse({}, status=200)        
        except ValidationError as e:
            return JsonResponse({'message': str(e)}, status=400) 
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500) 
        
    def check_data(self, data):
        if not 'player_one_id' in data or not 'player_two_id' in data:
            raise ValidationError('Missing user_id in data') 

class CheckUserInGame(View): 
    def __init__(self):
        super()

    async def get(self, request):
        try:
            if isinstance(request.user, AnonymousUser):  
                return JsonResponse({'message': 'No connected user'}, status=401)
            if request.user.is_ingame:
                return JsonResponse({'is_in_game': True, 'user_id': str(request.user.id)}, status=200)
            return JsonResponse({'is_in_game': False, 'user_id': str(request.user.id)}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)

 #//---------------------------------------> matchmaking utils <--------------------------------------\\#

def change_is_ingame_state(value: bool, user_instance=None, user_id=None):
    if user_id:
        try:
            if not isinstance(user_id, str):
                user_id = str(user_id)
            user = User.objects.get(id=user_id)
        except Exception as e:
            print(f'Error : {str(e)}')
            return
    else:
        user = user_instance
        
    user.is_ingame = value 
    user.save()

def is_already_in_tournament(request):
    try:
        print('TEEEESSSSTTTTTT')   
        data_response = async_to_sync(send_request)('GET', url='http://tournament:8000/api/tournament/get_tournament_state/', request=request)
        print(f'----> data reached: {data_response}') 
        is_in_tournament = data_response.json().get('isInTournament', None)
        print(f'----> data_response.json(): {data_response}') 
        return is_in_tournament
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=502)

def is_already_in_waiting_list(target_id: str): 
    unranked_waiting_users = redis_instance.lrange('unranked_waiting_users', 0, -1)
    unranked_waiting_users = [user_id.decode() for user_id in unranked_waiting_users]
    ranked_waiting_users = redis_instance.lrange('ranked_waiting_users', 0, -1)
    ranked_waiting_users = [user_id.decode() for user_id in ranked_waiting_users]
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
