from django.urls import path
from .match_result import MatchResultManager
from .utils import user_utils
from .view.MatchHistoryView import MatchHistoryView

urlpatterns = [
    path('add_user/', user_utils.add_new_user.as_view(), name='add_user'),
    path('match_result/', MatchResultManager.as_view(), name='match_result'),
    path('get_history/', MatchHistoryView.as_view(), name='get_history'),
]