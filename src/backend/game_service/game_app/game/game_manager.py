from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .game_utils import send_client_game_init
from .game_engine import PongGameEngine
from django.http import JsonResponse
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
    print(f'---------> async tasks : Game starting...')
    game_id_data = {
        'game': str(uuid.uuid4()),
        'player_one': data['player1'],
        'player_two': data['player2']
    }
    game_instance = PongGameEngine(game_id_data)
    await send_client_game_init(game_id_data=game_id_data, game_instance=game_instance)
    await running_game_instance(game_instance)

async def running_game_instance(instance):
    print(f'---------> async tasks : Game running...')
    await asyncio.sleep(5)
    result = await instance.game_loop()
    ending_game_instance(result)

async def ending_game_instance(result):
    print(f'---------> async tasks : Game ending...')
