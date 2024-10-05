
from django.apps import AppConfig
import threading
import asyncio


class UserAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'game_app'
    
    def ready(self):
        
        print('------------ IS READY ??? --------')
        asyncio.create_task(self.launch_thread)
        # thread = threading.Thread(target=background_task_game, daemon=True)
        
        
    def launch_thread(self):
        from .tasks import background_task_game
        
        thread = threading.Thread(target=background_task_game, daemon=True)
        thread.start()
