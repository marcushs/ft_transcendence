from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .game_manager import PongGameEngine
from celery import shared_task
from time import sleep
import redis
import os
import json

@shared_task
def launch_games_listener():
    redis_instance = redis.Redis(host='redis', port=6379, db=0)
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
    print('---------------->> CELERY WORKER: game_instance reached !')
    print(f'--------- Message data is : {data}')
    if isinstance(data, bytes):
        data = json.loads(data.decode('utf-8'))
    game_instance = PongGameEngine()
    game_start_payload = {
        'type': 'game_starting',
        'message': 'game found ! Starts in 5seconds'
    }
    async_to_sync(send_websocket_info)(player_id=data['player1'], payload=game_start_payload)
    async_to_sync(send_websocket_info)(player_id=data['player2'], payload=game_start_payload)
    sleep(6)
    game_instance.start_game()
    print('---------------->> CELERY WORKER: game_instance finished !')
    
async def send_websocket_info(player_id, payload):
    try:
        print('---------------->> CELERY WORKER: sending websocket info !') 
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f'game_{player_id}',
            payload
        )
    except Exception as e:
        print(f'---------------->> Error sending websocket info: {e}') 