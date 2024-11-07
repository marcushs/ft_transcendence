from django.urls import path
from .views import matchmaking
from .utils import user_utils

urlpatterns = [
    path('add_user/', user_utils.add_new_user.as_view(), name='add_user'),
    path("is_waiting/", matchmaking.CheckUserInWaitingQueue.as_view(), name="is_waiting"),
    path('user_is_in_game/', matchmaking.CheckUserInGame.as_view(), name='user_is_in_game'),
    path('update_user/', user_utils.update_user.as_view(), name='update_user'),
    path("matchmaking/", matchmaking.MatchmakingQueueManager.as_view(), name="matchmaking"),
    path("remove_waiting/", matchmaking.RemoveUserFromWaitingQueue.as_view(), name="remove_waiting"),
    path("change_game_status/", matchmaking.ChangeInGameUserStatus.as_view(), name="change_game_status"),
]