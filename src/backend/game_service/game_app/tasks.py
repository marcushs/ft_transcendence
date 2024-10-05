from celery import shared_task
from time import sleep
import redis
import os

@shared_task
def launch_games_listener():
    redis_instance = redis.Redis(host='redis', port=6379, db=0)
    pubsub = redis_instance.pubsub()
    pubsub.subscribe('matchmaking_manager')
    print('----------> REDIS connected - starting to listen on channels \'matchmaking manager\'')

    for message in pubsub.listen():
        print('--------- Message is : ', message)  
        start_game_instance.delay(message['data']) 

@shared_task
def start_game_instance(data):
    print('---------------->> CELERY WORKER: game_instance reached !')
    sleep(5)
    print('---------------->> CELERY WORKER: game_instance finished !') 