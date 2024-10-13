from django.urls import path
from .game_manager import send_map_dimension
from .tasks import startGameEngine

urlpatterns = [
    path('start_game/', startGameEngine.as_view(), name='start_game'),
]