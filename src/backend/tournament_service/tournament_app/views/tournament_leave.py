from ..db_utils import remove_user_from_tournament, get_members_count, delete_tournament_when_empty
from ..utils.weboscket_utils import send_websocket_info
from asgiref.sync import sync_to_async, async_to_sync
from ..consumers import connections, connections_lock
from django.shortcuts import aget_object_or_404
from ..models import Tournament, User
import json
import asyncio

leave_countdown_tasks = {}
leave_lock = asyncio.Lock()

async def exit_tournament(tournament, user_id): 
	user = await sync_to_async(User.objects.get)(id=str(user_id))
	await send_websocket_info(player_id=str(user_id), payload={'type': 'redirect_to_tournament_home'})
	await remove_user_from_tournament(tournament=tournament, user=user)
	member_count = await get_members_count(tournament)
	if member_count == 0:
		return await delete_tournament_when_empty(tournament)   
	await stop_leave_countdown(user_id)


async def tournament_lost_manager(data):
	async with connections_lock:
		if str(data['user_id']) in connections:
			await send_websocket_info(player_id=str(data['user_id']), payload={'type': data['type'], 'match': data['match']})
			await start_leave_countdown(user_id=str(data['user_id']), tournament_id=data['match']['tournament_id'])
		else:
			tournament = await aget_object_or_404(Tournament, tournament_id=data['match']['tournament_id'])
			await exit_tournament(tournament=tournament, user_id=str(data['user_id']))
 

async def start_leave_countdown(user_id, tournament_id): 
		async with leave_lock: 
			if user_id in leave_countdown_tasks:
				task = leave_countdown_tasks[user_id]
				if task.done():
					del leave_countdown_tasks[user_id]
				else:
					return
			leave_countdown_tasks[user_id] = asyncio.create_task(run_leave_countdown(user_id=user_id, tournament_id=tournament_id)) 
		

async def run_leave_countdown(user_id, tournament_id):
	countdown = 67
	while True:
		
		if countdown < 0:
			tournament = await sync_to_async(Tournament.objects.get)(tournament_id=tournament_id) 
			await stop_leave_countdown(user_id) 
			await exit_tournament(tournament=tournament, user_id=user_id)
			break
		 
		payload = {'type': 'countdown_update', 'time': countdown}
		await send_websocket_info(player_id=str(user_id), payload=payload)
		
		countdown -= 1
		await asyncio.sleep(1)


async def stop_leave_countdown(user_id):
	try:
		task = leave_countdown_tasks.get(user_id) 
		if task:
			task.cancel()
			try:
				await task
			except asyncio.CancelledError:
				pass
	except Exception as e:
		print(f"Error: {str(e)}")
	finally:
		async with leave_lock:
			if user_id in leave_countdown_tasks:
				del leave_countdown_tasks[user_id] 
