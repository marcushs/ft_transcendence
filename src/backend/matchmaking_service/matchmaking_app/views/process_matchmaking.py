from ..utils.user_utils import get_user_by_id, send_request
from matchmaking_service.consumers import get_connections
from ..utils.websocket_utils import send_websocket_info
from .matchmaking import change_is_ingame_state
from asgiref.sync import async_to_sync
from time import sleep
import asyncio
import random
import redis

redis_instance = redis.Redis(host='redis', port=6379, db=0)

# async def start_matchmaking_proccess(game_type):
#     print('-> thread: starting process_matchmaking async_tasks !')
#     asyncio.create_task(proccess_matchmaking(game_type))
#     print('-> thread: process_matchmaking async_tasks started!')


def proccess_matchmaking(game_type): 
    print(f'-> thread: proccess matchmaking reached !')
    try:
        player_one, player_two = get_players_from_redis(game_type)
        print(f'-> thread: player_one: {player_one} -- player_two: {player_two}')
        change_is_ingame_state(value=True, user_instance=player_one)
        change_is_ingame_state(value=True, user_instance=player_two)
        sleep(1.5)
        # if not check_connections(player_one_id=player_one_id, player_two_id=player_two_id):
        #     raise Exception('Players connections timeout, game initialisation canceled')
        async_to_sync(send_websocket_info)(player_id=player_one.id, payload={'type': 'game_found'})
        async_to_sync(send_websocket_info)(player_id=player_two.id, payload={'type': 'game_found'})
        sleep(1.5)
        send_start_game(game_type=game_type, player_one_id=str(player_one.id), player_two_id=str(player_two.id))
        print('-> thread: game init started ! tasks done !')
    except Exception as e:
        print(f'Error: thread: {str(e)}')
    
    if redis_instance.llen('{game_type}_waiting_users') > 1:
        proccess_matchmaking(game_type)

def get_players_from_redis(game_type):
    waiting_users = redis_instance.lrange(f'{game_type}_waiting_users', 0, -1) 
    waiting_users = [user_id.decode() for user_id in waiting_users] 
    if len(waiting_users) >= 3:
        random.shuffle(waiting_users)
    player_one = get_user_by_id(waiting_users.pop())
    player_two = get_user_by_id(waiting_users.pop())
    redis_instance.lrem(f'{game_type}_waiting_users', 0, str(player_one.id)) 
    redis_instance.lrem(f'{game_type}_waiting_users', 0, str(player_two.id))
    return player_one, player_two

def check_connections(player_one_id, player_two_id):
    count = 0
    max_checks = 20
    while True:
        connections = get_connections()
        print(f'-> thread: ---------------------------->  {connections}')
        if player_one_id in connections and player_two_id in connections:
            print('->thread: all players connected !')
            break
        print(f"->thread: waiting all players... : player_one: {player_one_id} -- player_two: {player_two_id} -- connections: {connections}")
        if count == max_checks:  
            return False 
        count += 1
        sleep(1) 
    return True

def send_start_game(game_type, player_one_id, player_two_id): 
    payload = { 
            'game_type': game_type, 
            'player1': player_one_id, 
            'player2': player_two_id
    }
    async_to_sync(send_request)(request_type='POST', url='http://game:8000/api/game/start_game/', payload=payload)