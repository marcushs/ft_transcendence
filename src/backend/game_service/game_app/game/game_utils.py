from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from channels.layers import get_channel_layer
from ..decorators import jwt_required
from django.http import JsonResponse
from django.views import View
import json

def get_map_dimension():
    return {'width': 1587.30, 'height': 1000}


async def send_client_game_init(game_data, game_instance): 
    map_dimension = get_map_dimension()
    game_state = game_instance.state
    payload = json.dumps({
        'type': 'game_ready_to_start',
        'game_id': game_data['game'],
        'game_state': game_state,
        'map_dimension': map_dimension
    })
    await send_websocket_info(player_id=game_data['player_one']['id'], payload=payload) 
    await send_websocket_info(player_id=game_data['player_two']['id'], payload=payload)


async def get_player_info(player_id):
    pass

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
        print(f'Error: {str(e)}')


@method_decorator(jwt_required, name='dispatch') 
class GetUserGameData(View):
    def __init__(self):
        super()

    async def get(self, request, user_id):
        from .game_engine import PongGameEngine

        try:
            game_data = PongGameEngine.get_user_game_data(str(user_id))
            if game_data:
                return JsonResponse({'status': 'success', 'game_data': json.dumps(game_data)}, status=200)
            return JsonResponse({'status': 'error'}, status=200)  
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)


@method_decorator(jwt_required, name='dispatch') 
class CheckGameStillActive(View):
    def __init__(self):
        super()

    async def get(self, request, user_id):
        from .game_engine import PongGameEngine

        try:
            game_id_string = request.GET.get('q', '')
            
            if not game_id_string:
                return JsonResponse({'status': 'error', 'message': 'invalid_id'}, status=200) 
            game_id = str(game_id_string)
            game_instance = PongGameEngine.get_active_game(game_id)
            if not game_instance:
                return JsonResponse({'status': 'error', 'message': 'not_found'}, status=200)
            if not game_instance.player_is_in_game(user_id):
                return JsonResponse({'status': 'success', 'user_in': False}, status=200)
            return JsonResponse({'status': 'success', 'user_in': True}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)

#//---------------------------------------> get games instance Endpoint <--------------------------------------\\#

@method_decorator(csrf_exempt, name='dispatch') 
class GetGameList(View):
    def __init__(self):
        super()

    async def get(self, request):
        from .game_engine import PongGameEngine

        try:
            games_data = [
                {
                    'game_id': game.game_id,
                    'player_one_id': game.player_one_id,
                    'player_two_id': game.player_two_id,
                    'game_active': game.game_active,
                }
                for game in PongGameEngine.active_games 
            ]
            return JsonResponse({'games_instance': games_data}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)
