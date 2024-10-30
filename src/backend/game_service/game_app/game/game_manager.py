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
    try:
        print(f'-> async_tasks: starting_game_instance reached with data : {data}')
        game_id_data = {
            'game': str(uuid.uuid4()),
            'player_one': data['player1'],
            'player_two': data['player2']
        }
        print(f'-> async_tasks: call pong game engine constructor...') 
        game_instance = PongGameEngine(game_id_data)
        print(f'-> async_tasks: pong game engine ready, start checking connections...')
        if not await check_connections(game_id_data):
            payload = {
            'player_one_id': game_id_data['player_one'], 
            'player_two_id': game_id_data['player_two']
            }
            await send_request(request_type='POST', url='http://matchmaking:8000/api/matchmaking/change_game_status/', payload=payload)  
            return
        print(f'-> async_tasks: connections ok, sending websocket...')
        await send_client_game_init(game_id_data=game_id_data, game_instance=game_instance)
        await running_game_instance(instance=game_instance, game_type=data['game_type'])
    except Exception as e:
        print(f'-> async_tasks: error: {str(e)}')


async def check_connections(data_id):
    player_one_id = data_id['player_one']
    player_two_id = data_id['player_two']
    
    count = 0
    max_checks = 20
    while True:
        async with asyncio.Lock():
            if player_one_id in connections and player_two_id in connections:
                print('->tasks: all players connected !') 
                break
        print(f"->tasks: waiting all players... : player_one: {player_one_id} -- player_two: {player_two_id} -- connections: {connections}")
        if count == max_checks:
            if player_one_id in connections:
                await send_websocket_info(player_id=player_one_id, payload={'type': 'connections_time_out'})
            if player_two_id in connections:
                await send_websocket_info(player_id=player_two_id, payload={'type': 'connections_time_out'})
            return False
        count += 1
        await asyncio.sleep(1)
    return True


async def running_game_instance(instance, game_type):
    print(f'-> async_tasks: Game <{instance.game_id}> running...') 
    await asyncio.sleep(8)
    winner, loser = await instance.game_loop()
    print(f'-> async_tasks: Game <{instance.game_id}> stopping...')
    if not (winner and loser):
        return
    await ending_game_instance(winner=winner, loser=loser, game_type=game_type)

async def ending_game_instance(winner, loser, game_type):
    try:
        payload = {
            'player_one_id': winner['id'], 
            'player_two_id': loser['id'] 
        }
        await send_request(request_type='POST', url='http://matchmaking:8000/api/matchmaking/change_game_status/', payload=payload)  
        payload = {
            'winner': winner,
            'loser': loser,
            'type': game_type
        }
        response = await send_request(request_type='POST', url='http://statistics:8000/api/statistics/match_result/', payload=payload) 
        print(f'-> async_tasks: Matchmaking update result responded with: {response.json()}') 
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
