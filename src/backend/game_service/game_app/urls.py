from .game.game_utils import CheckGameStillActive, GetGameList, GetUserGameData
from .game.game_manager import startGameEngine, SurrendGame
from django.urls import path

urlpatterns = [
    path('start_game/', startGameEngine.as_view(), name='start_game'),
    path('get_games_instance/', GetGameList.as_view(), name='get_games_instance'),
    path('game_is_active/', CheckGameStillActive.as_view(), name='game_is_active'),
    path('user_game_data/', GetUserGameData.as_view(), name='user_game_data'),
    path('surrend_game/', SurrendGame.as_view(), name='surrend_game'),
]