from .views.matchmaking import unranked_queue, change_is_ingame_state
from channels.layers import get_channel_layer
from .utils.user_utils import send_request
from asgiref.sync import async_to_sync
from .models import User
from time import sleep
import random

def periodic_check_ingame_status():
    sleep(5)
    while True:
        try:
            users_ingame = User.objects.filter(is_ingame=True)
            response = async_to_sync(send_request)(request_type='GET', url='http://game:8000/game/get_games_instance/')
            games_data = response.json().get('games_instance', [])
            users = get_users_to_update_list(users=users_ingame, games_data=games_data)
            print(f'Users in game: {users_ingame}')
            print(f'games: {games_data}')
            for user in users:
                print(f'user : {user} -- status {user.is_ingame}')
                user.is_ingame = False
                user.save()
            sleep(30)
        except Exception as e:
            print(f'Error: {e}')
            sleep(5)

def get_users_to_update_list(users, games_data):  
    is_in_game = False
    users_not_in_game = []
    for user in users:
        for game in games_data:
            print(f'user_id: {user.id} -- player1_id: {game['player_one_id']} -- player2_id: {game['player_two_id']}')
            if user.id == int(game['player_one_id']) or user.id == int(game['player_two_id']):
                is_in_game = True
                break
        if not is_in_game:
            users_not_in_game.append(user) 
        is_in_game = False
    return users_not_in_game
        

channel_layer = get_channel_layer()

 #//---------------------------------------> Thread: unranked matchmaking manager <--------------------------------------\\#

def background_task_unranked_matchmaking():
    waiting_list = []
    task_queue = unranked_queue
    
    while True:
        new_user = task_queue.get() 
        print('new_user: ', new_user)
        if new_user.is_ingame is True: 
            task_queue.task_done()
            continue
        print('new_user: ', new_user)
        launch_proccess(waiting_list=waiting_list, user=new_user)
        task_queue.task_done()

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
    
    change_is_ingame_state(value=True, user_instance=first_user)
    change_is_ingame_state(value=True, user_instance=second_user)
    
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