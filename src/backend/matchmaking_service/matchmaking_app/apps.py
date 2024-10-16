from django.apps import AppConfig
import threading

matchmaking_thread = None
ingame_check_thread = None

class UserAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'matchmaking_app'
    
    def ready(self):
        from .tasks import background_task_unranked_matchmaking, periodic_check_ingame_status
        global matchmaking_thread, ingame_check_thread
        if not matchmaking_thread or not matchmaking_thread.is_alive():
            matchmaking_thread = threading.Thread(target=background_task_unranked_matchmaking, daemon=True)
            matchmaking_thread.start()
        if not ingame_check_thread or not ingame_check_thread.is_alive():
            ingame_check_thread = threading.Thread(target=periodic_check_ingame_status, daemon=True)
            ingame_check_thread.start()