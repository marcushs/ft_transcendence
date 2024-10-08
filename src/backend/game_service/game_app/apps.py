
from django.apps import AppConfig
import redis
import os

class UserAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'game_app'
    
    def ready(self):
        from .tasks import launch_games_listener
        redis_instance = redis.Redis(host='redis', port=6379, db=0)

        if not redis_instance.get('game_listener_running'):
            redis_instance.set('game_listener_running', 'true')
            launch_games_listener.delay()
