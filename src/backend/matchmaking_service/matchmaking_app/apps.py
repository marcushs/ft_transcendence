from django.apps import AppConfig
import threading


class UserAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'matchmaking_app'
    
    def ready(self):
        from .tasks import background_task_unranked_matchmaking
        
        thread = threading.Thread(target=background_task_unranked_matchmaking, daemon=True)
        thread.start()