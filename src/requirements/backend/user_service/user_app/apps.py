from django.db.models.signals import post_migrate
from django.apps import AppConfig
import threading
import time

def start_consumer(sender, **kwargs):
    if sender.name == 'user_app':
        from .consumer import run_consumer

        consumer_thread = threading.Thread(target=run_consumer)
        consumer_thread.start()

class UserAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user_app'
    
    def ready(self):
        post_migrate.connect(start_consumer, sender=self)