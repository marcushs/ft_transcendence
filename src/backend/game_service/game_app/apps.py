from django.apps import AppConfig


class UserAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'game_app'
    
    def ready(self) -> None:
        from .game_listener import listen_for_games
        listen_for_games()
        
