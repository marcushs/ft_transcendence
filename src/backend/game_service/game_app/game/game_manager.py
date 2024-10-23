from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .game_utils import send_client_game_init
from ..exceptions import ExpectedException
from .game_engine import PongGameEngine
from ..decorators import jwt_required
from django.http import JsonResponse
from ..request import send_request
from django.views import View
import asyncio
import json
import uuid

#//---------------------------------------> start game instance Endpoint <--------------------------------------\\#

@method_decorator(csrf_exempt, name='dispatch')
class startGameEngine(View):
    def __init__(self):
        super()

    async def post(self, request):
        data = json.loads(request.body.decode('utf-8')) 
        if not 'player1' in data or not 'player2' in data or not 'game_type' in data:
            return JsonResponse({'status': 'error', 'message': 'Game cant start, invalid data sent'}, status=400)  
        asyncio.create_task(starting_game_instance(data))
        return JsonResponse({'status': 'success', 'message': 'Game instance started'}, status=200)

 #//---------------------------------------> game instance <--------------------------------------\\#

async def starting_game_instance(data):
    game_id_data = {
        'game': str(uuid.uuid4()),
        'player_one': str(data['player1']),
        'player_two': str(data['player2'])
    }
    game_instance = PongGameEngine(game_id_data)
    await send_client_game_init(game_id_data=game_id_data, game_instance=game_instance)
    await running_game_instance(instance=game_instance, game_type=data['game_type'])

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
            'winner': winner,
            'loser': loser,
            'type': game_type
        }
        response = await send_request(request_type='POST', url='http://matchmaking:8000/matchmaking/matchmaking_result/', payload=payload)
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
