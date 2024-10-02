from django.urls import path
from .views import MatchmakingView
from .utils import user_utils

urlpatterns = [
    path("matchmaking/", MatchmakingView.matchmaking_view.as_view(), name="matchmaking"), 
    path('add_user/', user_utils.add_new_user.as_view(), name='add_user'),
    path('update_user/', user_utils.update_user.as_view(), name='update_user')
]