from django.urls import path
from .utils import friends_utils

urlpatterns = [
    path('friends_info/', friends_utils.get_friend_request(), name='friends_info'),
]
 