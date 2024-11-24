from .send_game_request import send_game_instance_request

import asyncio

match_countdown_tasks = {}
lock = asyncio.Lock()

# Start new match countdown if no one is already started
async def start_match_countdown(match_id, player_ids):
	async with lock: 
		if match_id in match_countdown_tasks:
			task = match_countdown_tasks[match_id]
			if task.done():
				del match_countdown_tasks[match_id]
			else:
				return
		match_countdown_tasks[match_id] = asyncio.create_task(run_match_countdown(match_id, player_ids))
  
  
# Background async task running match countdown
async def run_match_countdown(match_id, player_ids):
	from ..utils.weboscket_utils import send_websocket_info  
    
	try:
		countdown = 60
		while True:
			if countdown < 0:
				payload = {
					'match_id': match_id,
					'player1': str(player_ids[0]),  
					'player2': str(player_ids[1])
				}
				await send_game_instance_request(payload)
				await stop_match_countdown(match_id)
				break
			payload = {'type': 'countdown_update', 'time': countdown}
			await send_websocket_info(player_id=str(player_ids[0]), payload={'type': 'countdown_update', 'time': countdown})
			await send_websocket_info(player_id=str(player_ids[1]), payload={'type': 'countdown_update', 'time': countdown})
			countdown -= 1
			await asyncio.sleep(1)
	except Exception as e:
		print(f'Error: {str(e)}')
	finally:
		async with lock:
			if match_id in match_countdown_tasks:
				del match_countdown_tasks[match_id]

# Stop the match countdown in background if it exist
async def stop_match_countdown(match_id):
	try:
		task = match_countdown_tasks.get(match_id) 
		if task:
			task.cancel()
			try:
				await task
			except asyncio.CancelledError:
				pass
	except Exception as e:
		print(f"Error: {str(e)}")
	finally:
		async with lock:
			if match_id in match_countdown_tasks:
				del match_countdown_tasks[match_id] 