from django.apps import AppConfig
import threading

class UserAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user_app'
    
    def ready(self):
        from .consumer import start_consumer

        consumer_thread = threading.Thread(target=start_consumer)
        consumer_thread.start()