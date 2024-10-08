"""
ASGI config for notifications_service project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see

https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""


import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'notifications_service.settings')

import django
django.setup() # Need to setup django first fpr JWTAuthMiddleware

from django.core.asgi import get_asgi_application
from channels.sessions import SessionMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from notifications_app.asgi_jwt_middleware import JWTAuthMiddleware
from .routing import websocket_urlpatterns


application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
            URLRouter(websocket_urlpatterns)
        )
})