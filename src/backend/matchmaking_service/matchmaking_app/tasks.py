from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .views.MatchmakingView import unranked_queue
from .utils.user_utils import send_request
import time
import queue
import random
import json
from .models import User

channel_layer = get_channel_layer()

def background_task_unranked_matchmaking():
    waiting_list = []
    task_queue = unranked_queue
    
    while True:
        new_user = task_queue.get() # is persitant ?
        if new_user.is_ingame is True: 
            task_queue.task_done()
            continue
        launch_proccess(waiting_list=waiting_list, user=new_user)
        task_queue.task_done()
        
def start_websocket_connection():
    pass


def launch_proccess(waiting_list, user):
    if not check_duplicate_user_in_waiting_list(target_user=user, waiting_list=waiting_list):
        return
    waiting_list.append(user)
    print('------------> waiting_list: ', waiting_list)
    if len(waiting_list) > 1:
            proccess_matchmaking(waiting_list=waiting_list)
             
             
def check_duplicate_user_in_waiting_list(target_user, waiting_list):
    for user in waiting_list:
        if user.id == target_user.id:
            return False
    return True
    

def proccess_matchmaking(waiting_list):
    if len(waiting_list) >= 3:
        random.shuffle(waiting_list)
        
    first_user = waiting_list.pop()
    second_user = waiting_list.pop()
    
    # change_is_ingame_state(value=True, user_instance=first_user)
    # change_is_ingame_state(value=True, user_instance=second_user)
    
    payload = { 
        'game_type': 'unranked',
        'player1': first_user.id,
        'player2': second_user.id
    }
    try:
        async_to_sync(send_request)(request_type='POST', url='http://game:8000/game/start_game/', payload=payload)
    except Exception as e:
        print(f'problem with requesting game_instance: {e}')
    
    if len(waiting_list) > 1:
        proccess_matchmaking(waiting_list=waiting_list)  
        

def change_is_ingame_state(value, user_instance=None, user_id=None):
    if user_id:
        try:
            user = User.objects.get(id=user_id)
        except Exception as e:
            print(f'Error : {e}')
            return
    else:
        user = user_instance
        
    user.is_ingame = value
    user.save()