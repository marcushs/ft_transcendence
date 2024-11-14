from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

waiting_messages = {}
        
def send_websocket_game_found(player_id, payload):
    from matchmaking_service.consumers import connections_lock, get_connections
    
    with connections_lock:
        connections = get_connections()
        if player_id in connections:
            async_to_sync(send_websocket_info)(player_id=player_id, payload=payload)
        else:
            print(f'save message for : {player_id}')
            if player_id not in waiting_messages:
                waiting_messages[player_id] = []
            waiting_messages[player_id].append(payload)


async def handle_waiting_messages(player_id):
    print(f'handle waiting message reached for : {player_id}')
    if player_id in waiting_messages:
        for message in waiting_messages[player_id]:
            print(f'-> message: {message}')
            await send_websocket_info(player_id=player_id, payload=message)
        del waiting_messages[player_id]


async def send_websocket_info(player_id, payload):
    try:
        if isinstance(payload, str):
            payload = json.loads(payload)
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f'matchmaking_searching_{player_id}', 
            payload
        )
    except Exception as e:
        print(f'---------------->> Error sending websocket info: {e}')