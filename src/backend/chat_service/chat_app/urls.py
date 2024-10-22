from django.urls import path

from .views import getChatroomsView, findMatchingChatroomView, getLast20MessagesView, getChatroomLastMessageView, getChatroomInfoView
from .utils.user_utils import add_new_user, check_username


urlpatterns = [
	path('add_user/', add_new_user.as_view(), name='add_user'),
	path('check_username/', check_username.as_view(), name='check_username'),
	path('get_chatrooms/', getChatroomsView.getChatroomsView.as_view(), name='get_chatrooms'),
	path('find_matching_chatroom/', findMatchingChatroomView.findMatchingChatroomView.as_view(), name='find_matching_chatroom'),
	path('get_last_20_messages/', getLast20MessagesView.getLast20MessagesView.as_view(), name="get_last_20_messages"),
	path('get_chatroom_last_message/', getChatroomLastMessageView.getChatroomLastMessageView.as_view(), name="get_last_20_messages"),
	path('get_chatroom_info/', getChatroomInfoView.getChatroomInfoView.as_view(), name="get_chatroom_info"),
]
