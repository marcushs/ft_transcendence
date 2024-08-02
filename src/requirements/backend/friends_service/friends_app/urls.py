from django.urls import path
from .views import friendship_status
from .utils import user_utils

urlpatterns = [
    path('add_user/', user_utils.add_new_user.as_view(), name='add_user'),
    path('update_user/', user_utils.update_user.as_view(), name='update_user'),
    path('friendship_status/', friendship_status.GetFriendShipStatus.as_view(), name='friendship_status'),
]