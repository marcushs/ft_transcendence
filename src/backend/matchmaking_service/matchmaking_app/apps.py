from django.apps import AppConfig
import threading

unranked_matchmaking_thread = None
ranked_matchmaking_thread = None
ingame_check_thread = None

class UserAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'matchmaking_app'
    
    def ready(self):
        from .tasks import background_task_unranked_matchmaking,  background_task_ranked_matchmaking, periodic_check_ingame_status
        global unranked_matchmaking_thread, ranked_matchmaking_thread, ingame_check_thread
        if not unranked_matchmaking_thread or not unranked_matchmaking_thread.is_alive():
            unranked_matchmaking_thread = threading.Thread(target=background_task_unranked_matchmaking, daemon=True)
            unranked_matchmaking_thread.start()
        if not ranked_matchmaking_thread or not ranked_matchmaking_thread.is_alive():
            ranked_matchmaking_thread = threading.Thread(target=background_task_ranked_matchmaking, daemon=True)
            ranked_matchmaking_thread.start()
        if not ingame_check_thread or not ingame_check_thread.is_alive():
            ingame_check_thread = threading.Thread(target=periodic_check_ingame_status, daemon=True) 
            ingame_check_thread.start()