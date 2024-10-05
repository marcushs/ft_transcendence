from celery import shared_task
from time import sleep

@shared_task
def start_game_instance(data):
    print('---------------->> CELERY WORKER: game_instance reached !')
    sleep(5)
    print('---------------->> CELERY WORKER: game_instance finished !')