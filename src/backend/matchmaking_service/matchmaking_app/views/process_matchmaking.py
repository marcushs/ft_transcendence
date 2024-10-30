from ..utils.websocket_utils import send_websocket_game_found
from ..utils.user_utils import get_user_by_id, send_request
from .matchmaking import change_is_ingame_state
from asgiref.sync import async_to_sync
from time import sleep
import random
import redis

redis_instance = redis.Redis(host='redis', port=6379, db=0)

def proccess_matchmaking(game_type): 
    print(f'-> thread: proccess matchmaking reached !')
    try:
        player_one, player_two = get_players_from_redis(game_type)
        print(f'-> thread: player_one: {player_one} -- player_two: {player_two}')
        change_is_ingame_state(value=True, user_instance=player_one)
        change_is_ingame_state(value=True, user_instance=player_two)
        redis_instance.lrem(f'{game_type}_waiting_users', 0, str(player_one.id)) 
        redis_instance.lrem(f'{game_type}_waiting_users', 0, str(player_two.id))
        send_websocket_game_found(player_id=str(player_one.id), payload={'type': 'game_found'})
        send_websocket_game_found(player_id=str(player_two.id), payload={'type': 'game_found'})
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
    return player_one, player_two

def send_start_game(game_type, player_one_id, player_two_id): 
    payload = { 
            'game_type': game_type, 
            'player1': player_one_id, 
            'player2': player_two_id
    }
    async_to_sync(send_request)(request_type='POST', url='http://game:8000/api/game/start_game/', payload=payload)