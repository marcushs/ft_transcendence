from django.urls import path
from .consumers import ContactsConsumer

websocket_urlpatterns = [
    path('ws/contacts/', ContactsConsumer.as_asgi())
]