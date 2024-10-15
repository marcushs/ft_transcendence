from django.contrib.auth.models import AnonymousUser
from channels.layers import get_channel_layer
from django.http import JsonResponse
from django.views import View
import json

def get_map_dimension():
    return {'width': 1587.30, 'height': 1000}


async def send_client_game_init(game_id_data, game_instance): 
    map_dimension = get_map_dimension()
    game_state = game_instance.state
    payload = json.dumps({
        'type': 'game_ready_to_start',
        'game_id': game_id_data['game'],
        'game_state': game_state,
        'map_dimension': map_dimension
    })
    await send_websocket_info(player_id=game_id_data['player_one'], payload=payload) 
    await send_websocket_info(player_id=game_id_data['player_two'], payload=payload)


async def send_websocket_info(player_id, payload):
    try:
        if isinstance(payload, str):
            payload = json.loads(payload)
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f'game_{player_id}',
            payload
        )
    except Exception as e:
        print(f'---------------->> Error sending websocket info: {e}')
        
class CheckGameStillActive(View):
    def __init__(self):
        super()

    async def get(self, request):
        from .game_engine import PongGameEngine
        
        game_id_string = request.GET.get('q', '')
        
        if not (game_id_string or game_id_string.isdigit()):
             return JsonResponse({'status': 'error', 'message': 'Invalid game_id'}, status=200)
        game_id = int(game_id_string)
        game_instance = PongGameEngine.get_active_game(game_id)
        if not game_instance:
            return JsonResponse({'status': 'success', 'message': 'game still active'}, status=200)
        else:
            return JsonResponse({'status': 'error', 'message': 'game not found'}, status=200)