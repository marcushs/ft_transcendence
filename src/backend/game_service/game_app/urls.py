from django.urls import path
from .game.game_manager import startGameEngine, GetGameList
from .game.game_utils import CheckGameStillActive

urlpatterns = [
    path('start_game/', startGameEngine.as_view(), name='start_game'),
    path('get_games_instance/', GetGameList.as_view(), name='get_games_instance'),
    path('game_is_active/', CheckGameStillActive.as_view(), name='game_is_active'),
]