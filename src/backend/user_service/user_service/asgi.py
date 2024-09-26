"""
ASGI config for user_service project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'user_service.settings')

import django
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from .routing import websocket_urlpatterns
from user_app.websocket_middleware import JWTAuthMiddleware
from user_app.tasks import start_background_tasks
import asyncio


application = ProtocolTypeRouter({ 
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(URLRouter(websocket_urlpatterns))
})

async def start_background_tasks_wrapper():
    await start_background_tasks()

asyncio.run(start_background_tasks_wrapper())   