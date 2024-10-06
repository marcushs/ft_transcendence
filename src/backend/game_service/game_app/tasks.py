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
    sleep(5)
    print('---------------->> CELERY WORKER: game_instance finished !')