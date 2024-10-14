from django.urls import path
from .game.game_manager import startGameEngine

urlpatterns = [
    path('start_game/', startGameEngine.as_view(), name='start_game'),
]