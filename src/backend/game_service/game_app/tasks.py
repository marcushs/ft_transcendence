from .game_manager import PongGameEngine, get_map_dimension
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .websocket_utils import send_websocket_info
from django.http import JsonResponse
from django.views import View
import asyncio
import json
import uuid

@method_decorator(csrf_exempt, name='dispatch')
class startGameEngine(View):
    def __init__(self):
        super()

    async def post(self, request):
        data = json.loads(request.body.decode('utf-8')) 
        print('startgameengine reached !')

        if not 'player1' in data or not 'player2' in data or not 'game_type' in data:
            return JsonResponse({'status': 'error', 'message': 'Game cant start, invalid data sent'}, status=400) 
            
        asyncio.create_task(start_game_instance(data))
        return JsonResponse({'status': 'success', 'message': 'Game instance started'}, status=200)


async def start_game_instance(data):
    print(f'--------- asynchronous tasks : game_instance reached ! data is : {data}')
    game_id = str(uuid.uuid4())
    game_instance = PongGameEngine(game_id=game_id, player_one_id=data['player1'], player_two_id=data['player2'])
    await send_game_ready(players_id={'player1': data['player1'], 'player2': data['player2']}, game_id=game_id, game_instance=game_instance) 
    await asyncio.sleep(5)
    await game_instance.game_loop()
    
    
async def send_game_ready(players_id, game_id, game_instance): 
    map_dimension = get_map_dimension()
    game_state = game_instance.get_game_state()
    payload = json.dumps({
        'type': 'game_ready_to_start',
        'game_id': game_id,
        'game_state': game_state,
        'map_dimension': map_dimension
    })
    await send_websocket_info(player_id=players_id['player1'], payload=payload) 
    await send_websocket_info(player_id=players_id['player2'], payload=payload)
    
