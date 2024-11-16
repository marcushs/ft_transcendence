from .view.RankedFinder import GetMatchableRankedPlayers
from .view.GetUserStatistics import GetUserStatistics
from .view.MatchHistoryView import MatchHistoryView
from .match_result import MatchResultManager
from .utils import user_utils
from django.urls import path

urlpatterns = [
    path('update_user/', user_utils.update_user.as_view(), name='update_user'),
    path('add_user/', user_utils.add_new_user.as_view(), name='add_user'),
    path('match_result/', MatchResultManager.as_view(), name='match_result'),
    path('get_history/', MatchHistoryView.as_view(), name='get_history'),
    path('get_ranked_pair/', GetMatchableRankedPlayers.as_view(), name='get_ranked_pair'),
    path('get_user_statistics/', GetUserStatistics.as_view(), name='get_user_statistics'),
]
