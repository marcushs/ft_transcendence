from __future__ import absolute_import, unicode_literals
from celery import Celery
import os

# define env django for celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game_service.settings')

# create instance of celery
app = Celery('game_service')

# Load celery config in settings.py
app.config_from_object('django.conf:settings', namespace='CELERY')

# allow auto tasks detection in apps
app.autodiscover_tasks()

app.conf.broker_connection_retry_on_startup = True

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')