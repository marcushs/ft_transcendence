import time
import queue
import random
from .views.MatchmakingView import unranked_queue


def background_task_unranked_matchmaking():
    waiting_list = []
    task_queue = unranked_queue
    while True:
        new_user = task_queue.get() # is persitant ?
        if new_user.is_ingame is True:
            continue
        launch_proccess(waiting_list=waiting_list, user=new_user)
        print(f'---------- waiting list === {waiting_list} -----------')
        print(f'------- IS IN GAME SHOULD BE TRUE {new_user.is_ingame} ------------')  
        new_user.is_ingame = False
        new_user.save()
        task_queue.task_done()
        
def launch_proccess(waiting_list, user):
    print(f'------------ TEST {user} -------------') 
    if not check_duplicate_user_in_waiting_list(target_user=user, waiting_list=waiting_list):
        return
    print(f'------- IS IN GAME SHOULD BE FALSE  {user.is_ingame}------------') 
    user.is_ingame = True
    user.save()
    waiting_list.append(user)
    if len(waiting_list) > 1:
            proccess_matchmaking(waiting_list=waiting_list)
             
def check_duplicate_user_in_waiting_list(target_user, waiting_list):
    for user in waiting_list:
        if user.id == target_user.id:
            return False
    return True
    

def proccess_matchmaking(waiting_list):
    if len(waiting_list) == 1:
        return
    if len(waiting_list) >= 3:
        random.shuffle(waiting_list)
    print(f'-------- waiting = {waiting_list} ------------')  
    match_users_pair = (waiting_list.pop(), waiting_list.pop()) 
    print(f'---------- MATCH = {match_users_pair} --------------')    
    # mettre le websocket ici
    if len(waiting_list) <= 1:
        proccess_matchmaking(waiting_list=waiting_list)