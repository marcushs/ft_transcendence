"""
ASGI config for statistics_service project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see

https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'statistics_service.settings')

import django
django.setup() # Need to setup django first fpr JWTAuthMiddleware

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
})