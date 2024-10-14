from django.apps import AppConfig
import threading


class UserAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'matchmaking_app'
    
    def ready(self):
        from .tasks import background_task_unranked_matchmaking, periodic_check_ingame_status
        
        matchmaking_thread = threading.Thread(target=background_task_unranked_matchmaking, daemon=True)
        matchmaking_thread.start()
        ingame_check_thread = threading.Thread(target=periodic_check_ingame_status, daemon=True)
        ingame_check_thread.start()