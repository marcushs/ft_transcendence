from channels.layers import get_channel_layer
from .websocket_utils import send_websocket_info
from asgiref.sync import async_to_sync
from .game_manager import PongGameEngine
from celery import shared_task
from time import sleep
import redis
import os
import json
import uuid

redis_instance = redis.Redis(host='redis', port=6379, db=0)

@shared_task
def launch_games_listener():
    pubsub = redis_instance.pubsub()
    pubsub.subscribe('matchmaking_manager')
    print('----------> REDIS connected - starting to listen on channels \'matchmaking manager\'')

    for message in pubsub.listen():
        if message['type'] == 'message':
            data = get_instance_info_from_data(message['data'])
            if not data:
                continue
            start_game_instance.delay(message['data'])   
        
def get_instance_info_from_data(raw_data):
    if isinstance(raw_data, bytes):
        try:
            data = json.loads(raw_data.decode('utf-8')) 
            return data
        except json.JSONDecodeError:
            print(f'JSON \'{raw_data}\' decoding failed')
            return None
    else:
        print(f'Invalid data received \'{raw_data}\'')
        return None

@shared_task
def start_game_instance(data):
    print(f'--------- CELERY WORKER: game_instance reached ! data is : {data}')
    if isinstance(data, bytes):
        data = json.loads(data.decode('utf-8'))
    game_instance_id = str(uuid.uuid4())
    async_to_sync(send_websocket_info)(player_id=data['player1'], payload={'type': 'game_found', 'game_id': game_instance_id}) 
    async_to_sync(send_websocket_info)(player_id=data['player2'], payload={'type': 'game_found', 'game_id': game_instance_id})
    pubsub = redis_instance.pubsub()
    pubsub.subscribe(f'waiting_for_start:{game_instance_id}')
    for message in pubsub.listen():
        if message['type'] == 'message':
            pubsub.close()
            redis_data = json.loads(message['data'].decode('utf-8'))
            print(f'redis data loaded in celery worker : {redis_data}') 
            game_instance = PongGameEngine(game_id=game_instance_id, width=redis_data['width'], height=redis_data['height'], player_one_id=data['player1'], player_two_id=data['player2'])
            break   
    game_instance.game_loop()
    print('---------------->> CELERY WORKER: game_instance finished !') 