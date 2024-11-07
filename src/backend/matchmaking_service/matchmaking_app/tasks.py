from .views.process_matchmaking import proccess_matchmaking
from .views.matchmaking import unranked_queue, ranked_queue
from channels.layers import get_channel_layer
from .utils.user_utils import send_request
from .utils.websocket_utils import send_websocket_info
from asgiref.sync import async_to_sync
from .models import User
from time import sleep
import redis

redis_instance = redis.Redis(host='redis', port=6379, db=0)


def periodic_check_ingame_status():
    sleep(10)
    while True:
        try:
            users_ingame = User.objects.filter(is_ingame=True)
            response = async_to_sync(send_request)(request_type='GET', url='http://game:8000/api/game/get_games_instance/')
            games_data = response.json().get('games_instance', [])
            users = get_users_to_update_list(users=users_ingame, games_data=games_data) 
            for user in users:
                user.is_ingame = False
                user.save()
            sleep(60)
        except Exception as e:
            print(f'Error: {e}')
            sleep(30) 


def get_users_to_update_list(users, games_data):    
    is_in_game = False
    users_not_in_game = []
    for user in users:
        for game in games_data:
            if str(user.id) == game['player_one_id'] or str(user.id) == game['player_two_id']:
                is_in_game = True
                break
        if not is_in_game:
            users_not_in_game.append(user)  
        is_in_game = False
    return users_not_in_game

 #//---------------------------------------> Thread: unranked matchmaking manager <--------------------------------------\\#

channel_layer = get_channel_layer()

def background_task_unranked_matchmaking():
    task_queue = unranked_queue
    
    while True:
        new_user = task_queue.get()
        if new_user.is_ingame is True:
            async_to_sync(send_websocket_info)(player_id=str(new_user.id), payload={'type': 'already_in_game'})
            task_queue.task_done()
            continue
        launch_proccess(user=new_user, game_type='unranked') 
        task_queue.task_done()

 #//---------------------------------------> Thread: ranked matchmaking manager <--------------------------------------\\#
  
def background_task_ranked_matchmaking():
    task_queue = ranked_queue
    
    while True:
        new_user = task_queue.get() 
        if new_user.is_ingame is True:
            async_to_sync(send_websocket_info)(player_id=str(new_user.id), payload={'type': 'already_in_game'})
            task_queue.task_done()
            continue
        launch_proccess(user=new_user, game_type='ranked')
        task_queue.task_done()

 #//---------------------------------------> Thread: generic matchmaking method <--------------------------------------\\#

def launch_proccess(user, game_type):
    redis_instance.rpush(f'{game_type}_waiting_users', str(user.id))
    print(f'-> thread: user : {user} user_id: {str(user.id)} added to redis waiting_list, waiting_list len : {redis_instance.llen(f'{game_type}_waiting_users')}!')
    if redis_instance.llen(f'{game_type}_waiting_users') > 1:
        proccess_matchmaking(game_type) 