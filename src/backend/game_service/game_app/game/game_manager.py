from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .game_utils import send_client_game_init, send_websocket_info
from ..exceptions import ExpectedException
from .game_engine import PongGameEngine
from ..decorators import jwt_required
from django.http import JsonResponse
from ..request import send_request
from django.views import View
from game_service.consumers import connections
import asyncio
import json
import uuid

#//---------------------------------------> start game instance Endpoint <--------------------------------------\\#

@method_decorator(csrf_exempt, name='dispatch')
class startGameEngine(View):
    def __init__(self):
        super()

    async def post(self, request): 
        try:
            print('!!!! startGameEngine REACHED !!!!')
            data = json.loads(request.body.decode('utf-8'))
            if not 'player1' in data or not 'player2' in data or not 'game_type' in data:
                return JsonResponse({'status': 'error', 'message': 'Game cant start, invalid data sent'}, status=400)  
            asyncio.create_task(starting_game_instance(data))
            return JsonResponse({'status': 'success', 'message': 'Game instance started'}, status=200)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)  

 #//---------------------------------------> game instance <--------------------------------------\\#

async def starting_game_instance(data):

    player_one_infos = (await send_request(request_type="GET", url=f"http://user:8000/api/user/get_user_by_id/?q={str(data['player1'])}")).json()['user_data']
    player_two_infos = (await send_request(request_type="GET", url=f"http://user:8000/api/user/get_user_by_id/?q={str(data['player2'])}")).json()['user_data']

    try:
        game_users_data = {
            'game': str(uuid.uuid4()),
            'game_type': str(data['game_type']),
            'player_one': {
                'id': str(data['player1']),
                'user_infos': {
                    'profile_image': "http://user:8000/api/user" + player_one_infos['profile_image'] if player_one_infos['profile_image'] else player_one_infos['profile_image_link'],
                    'username': player_one_infos['username']
                }
            },
            'player_two': {
                'id': str(data['player2']),
                'user_infos': {
                    'profile_image': "http://user:8000/api/user" + player_two_infos['profile_image'] if player_two_infos['profile_image'] else player_two_infos['profile_image_link'],
                    'username': player_two_infos['username']
                }
            },
        }
        print(f'-> async_tasks: call pong game engine constructor...')
        game_instance = PongGameEngine(game_users_data)
        print(f'-> async_tasks: pong game engine ready, start checking connections...')
        if not await check_connections(game_users_data):
            payload = {
                'player_one_id': game_users_data['player_one']['id'],
                'player_two_id': game_users_data['player_two']['id']
            }
            await send_request(request_type='POST', url='http://matchmaking:8000/api/matchmaking/change_game_status/', payload=payload)
            return
        asyncio.sleep(0.5)
        print(f'-> async_tasks: connections ok, sending websocket...')
        await send_client_game_init(game_data=game_users_data, game_instance=game_instance)
        await running_game_instance(instance=game_instance, data=game_users_data)
    except Exception as e:
        print(f'-> async_tasks: error: {str(e)}')


async def check_connections(data):
    player_one_id = data['player_one']['id']
    player_two_id = data['player_two']['id']
    
    count = 1
    max_checks = 21
    while True:
        async with asyncio.Lock():
            if player_one_id in connections and player_two_id in connections:
                print('->tasks: all players connected !')
                break
        print(f"->tasks: waiting all players... retry <{count}>")
        if count == max_checks:
            if player_one_id in connections:
                await send_websocket_info(player_id=player_one_id, payload={'type': 'connections_time_out'})
            if player_two_id in connections:
                await send_websocket_info(player_id=player_two_id, payload={'type': 'connections_time_out'})
            return False
        count += 1
        await asyncio.sleep(1)
    return True


async def running_game_instance(instance, data):
    print(f'-> async_tasks: Game <{instance.game_id}> running...') 
    await asyncio.sleep(8)
    await instance.game_loop()
    print(f'-> async_tasks: Game <{instance.game_id}> stopping...')
    await ending_game_instance(data) 


async def ending_game_instance(data):
    try:
        payload = {
            'player_one_id': data['player_one']['id'],
            'player_two_id': data['player_two']['id']
        }
        await send_request(request_type='POST', url='http://matchmaking:8000/api/matchmaking/change_game_status/', payload=payload)
    except Exception as e:
        print(f'-> async_tasks: {e}')

#//---------------------------------------> surrend games instance Endpoint <--------------------------------------\\#

@method_decorator(jwt_required, name='dispatch')
class SurrendGame(View):
    def __init__(self):
        super()


    async def post(self, request, user_id):
        try:
            data = json.loads(request.body.decode('utf-8'))
            self.check_data(data=data, user_id=user_id) 
            await self.game_instance.player_surrender(self.player_id)
            return JsonResponse({'message': 'surrender done'}, status=200)
        except ExpectedException as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=200)
        except Exception as e:
            print(f'error: surrend_game: {str(e)}')
            return JsonResponse({'message': str(e)}, status=400)


    def check_data(self, data, user_id):
        if not ('game_id' in data or 'player_id' in data):
            raise ExpectedException('missing some informations')
        self.player_id = str(data['player_id'])
        if self.player_id != user_id:
            raise ExpectedException('player ID does not match the current client user')
        self.game_instance = PongGameEngine.get_active_game(str(data['game_id']))
        if not self.game_instance:
            raise ExpectedException('game ID does not match any current game')
        if not (self.game_instance.player_is_in_game(self.player_id)):
            raise ExpectedException('player is not in the game')
