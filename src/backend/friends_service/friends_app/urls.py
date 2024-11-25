from django.urls import path
from .views import friendship_status, get_friends_list, friendship_manager
from .utils import user_utils, websocket_utils

urlpatterns = [
    path('delete_user/', user_utils.DeleteUser.as_view(), name='delete_user'),
    path('add_user/', user_utils.AddNewUser.as_view(), name='add_user'),
    path('update_user/', user_utils.update_user.as_view(), name='update_user'),
    path('friendship_status/', friendship_status.GetFriendShipStatus.as_view(), name='friendship_status'),
    path('manage_friendship/', friendship_manager.friendshipManager.as_view(), name='manage_friendship'),
    path('search_contacts/', get_friends_list.GetFriendsList.as_view(), name='search_contacts'),
    path('update_contacts/', websocket_utils.handle_friend_info_change.as_view(), name='update_contacts'),
] 
