from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .views.MatchmakingView import unranked_queue
import time
import queue
import random

def background_task_unranked_matchmaking():
    channel_layer = get_channel_layer()
    waiting_list = []
    task_queue = unranked_queue
    
    while True:
        new_user = task_queue.get() # is persitant ?
        if new_user.is_ingame is True: 
            task_queue.task_done()
            continue
        launch_proccess(channel_layer=channel_layer, waiting_list=waiting_list, user=new_user)
        print(f'---------- waiting list === {waiting_list} -----------')
        print(f'------- IS IN GAME SHOULD BE TRUE {new_user.is_ingame} ------------')    
        task_queue.task_done()
        
def start_websocket_connection():
    pass


def launch_proccess(channel_layer, waiting_list, user):
    print(f'------------ TEST {user} -------------')
    if not check_duplicate_user_in_waiting_list(target_user=user, waiting_list=waiting_list):
        return
    print(f'------- IS IN GAME SHOULD BE FALSE  {user.is_ingame}------------') 
    waiting_list.append(user)
    if len(waiting_list) > 1:
            proccess_matchmaking(channel_layer=channel_layer, waiting_list=waiting_list)
             
             
def check_duplicate_user_in_waiting_list(target_user, waiting_list):
    for user in waiting_list:
        if user.id == target_user.id:
            return False
    return True
    

def proccess_matchmaking(channel_layer, waiting_list):
    if len(waiting_list) >= 3:
        random.shuffle(waiting_list)
    print(f'-------- waiting = {waiting_list} ------------') 
    first_user = waiting_list.pop()
    second_user = waiting_list.pop()
    
    first_user.is_ingame = True
    first_user.save()
    second_user.is_ingame = True
    second_user.save()
    
    match_users_pair = (first_user, second_user)
    print(f'---------- MATCH = {match_users_pair} --------------')  
    async_to_sync(channel_layer.group_send)( 
        'matchmaking_game_connection',
        {
            'type': 'send_match_pair',
            'game_type': 'unranked',
            'player1': match_users_pair[0],
            'player2': match_users_pair[1]
        } 
    )
    if len(waiting_list) > 1:
        proccess_matchmaking(waiting_list=waiting_list)  