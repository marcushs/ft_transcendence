from django.urls import path
from .views.matchmaking import MatchmakingQueueManager, MatchmakingResultManager, CheckUserInWaitingQueue, RemoveUserFromWaitingQueue
from .utils import user_utils

urlpatterns = [
    path('add_user/', user_utils.add_new_user.as_view(), name='add_user'),
    path("is_waiting/", CheckUserInWaitingQueue.as_view(), name="is_waiting"),
    path('update_user/', user_utils.update_user.as_view(), name='update_user'),
    path("matchmaking/", MatchmakingQueueManager.as_view(), name="matchmaking"), 
    path("remove_waiting/", RemoveUserFromWaitingQueue.as_view(), name="remove_waiting"),
    path("matchmaking_result/", MatchmakingResultManager.as_view(), name="matchmaking_result"),
]