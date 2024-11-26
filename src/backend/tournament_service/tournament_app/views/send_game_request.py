from ..utils.request import send_request_with_request
from ..utils.weboscket_utils import send_websocket_info
from ..db_utils import set_players_in_game

async def send_game_instance_request(data):
	await set_players_in_game(data['player1'], data['player2'])
	payload = { 
		'game_type': 'tournament',
		'match_id': data['match_id'], 
		'player1': data['player1'],  
		'player2': data['player2']
	}
	await send_websocket_info(player_id=data['player1'], payload={'type': 'start_game_instance', 'payload': payload})
	await send_websocket_info(player_id=data['player2'], payload={'type': 'start_game_instance', 'payload': payload})
	await send_request_with_request(request_type='POST', url='http://matchmaking:8000/api/matchmaking/matchmaking_tournament/', payload=payload)  

