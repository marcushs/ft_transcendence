from .views.matchmaking import unranked_queue, change_is_ingame_state
from channels.layers import get_channel_layer
from .utils.user_utils import send_request, get_user_by_id
from asgiref.sync import async_to_sync
from matchmaking_service.consumers import connections
from .models import User
from time import sleep
import json
import random
import redis

redis_instance = redis.Redis(host='redis', port=6379, db=0)


def periodic_check_ingame_status():
    sleep(10)
    while True:
        try:
            users_ingame = User.objects.filter(is_ingame=True)
            response = async_to_sync(send_request)(request_type='GET', url='http://game:8000/game/get_games_instance/')
            games_data = response.json().get('games_instance', [])
            users = get_users_to_update_list(users=users_ingame, games_data=games_data) 
            for user in users:
                user.is_ingame = False
                user.save()
            sleep(60)
        except Exception as e:
            print(f'Error: {e}')
            sleep(15) 


def get_users_to_update_list(users, games_data):
    is_in_game = False
    users_not_in_game = []
    for user in users:
        for game in games_data:
            if user.id == int(game['player_one_id']) or user.id == int(game['player_two_id']):
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
            task_queue.task_done()
            continue
        launch_proccess(user=new_user)
        task_queue.task_done()

def launch_proccess(user):
    redis_instance.rpush('waiting_users', user.id)
    if redis_instance.llen('waiting_users') > 1:
            proccess_matchmaking()


def proccess_matchmaking():
    waiting_users = redis_instance.lrange('waiting_users', 0, -1)
    waiting_users = [user_id.decode() for user_id in waiting_users] 
    
    if len(waiting_users) >= 3:
        random.shuffle(waiting_users)
    player_one_id = waiting_users.pop()
    player_two_id = waiting_users.pop()
    try:
        redis_instance.lrem('waiting_users', 0, player_one_id)
        redis_instance.lrem('waiting_users', 0, player_two_id)
        player_one = get_user_by_id(player_one_id)
        player_two = get_user_by_id(player_two_id)
    except Exception as e:
        print(f'Error: thread: {str(e)}')
    
    change_is_ingame_state(value=True, user_instance=player_one)
    change_is_ingame_state(value=True, user_instance=player_two) 
    # count = 0
    # max_checks = 20
    try:
        # while True:
        #     if player_one_id in connections and player_two_id in connections: 
        #         print('all players connected !')
        #         break
        #     print('waiting all players...')
            # if count == max_checks: # put here a send socket to client for indicate the game is canceled
                # return
            # count += 1
            # sleep(0.5)
        payload = {'type': 'game_found'}
        async_to_sync(send_websocket_info)(player_id=player_one_id, payload=payload)
        async_to_sync(send_websocket_info)(player_id=player_two_id, payload=payload)
        sleep(2)
        payload = { 
            'game_type': 'unranked',
            'player1': player_one_id,
            'player2': player_two_id
        }
        async_to_sync(send_request)(request_type='POST', url='http://game:8000/game/start_game/', payload=payload)
    except Exception as e:
        print(f'problem with requesting game_instance: {e}')
    
    if redis_instance.llen('waiting_users') > 1:
        proccess_matchmaking()
        
async def send_websocket_info(player_id, payload):
    try:
        if isinstance(payload, str):
            payload = json.loads(payload)
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f'matchmaking_searching_{player_id}',
            payload
        )
    except Exception as e:
        print(f'---------------->> Error sending websocket info: {e}')