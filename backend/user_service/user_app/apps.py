from django.apps import AppConfig
import threading

class UserAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user_app'
    
    def ready(self):
        from .tasks import background_task_status_manager
        
        
        thread = threading.Thread(target=background_task_status_manager, daemon=True)
        thread.start()