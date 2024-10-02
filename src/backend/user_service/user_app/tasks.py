from .utils.websocket_utils import notify_user_info_display_change
from asgiref.sync import async_to_sync, sync_to_async
from django.utils import timezone
from datetime import timedelta
from .models import User
import time

def background_task_status_manager():
    while True:
        away_users =  list(User.objects.filter(status='away'))
        async_to_sync(set_new_users_status)(users=away_users, status_change='offline')  
        online_users = list(User.objects.filter(status='online'))
        async_to_sync(set_new_users_status)(users=online_users, status_change='away')
        time.sleep(65)
        
async def set_new_users_status(users, status_change):
    if status_change == 'away': 
        threshold = timezone.now() - timedelta(minutes=3, seconds=30)
    else:
        threshold = timezone.now() - timedelta(minutes=15)  
    for user in users:
        if user.last_active < threshold:
            old_status = user.status
            user.status = status_change
            await sync_to_async(user.save)()
            await notify_user_info_display_change(user=user, change_info='status', old_value=old_status)