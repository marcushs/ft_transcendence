from django.urls import path

from .views import chatView, getChatroomsView, findMatchingChatroomView
from .utils.user_utils import add_new_user, check_username


urlpatterns = [
    path('chat_view/', chatView.chat_view.as_view(), name='chat_view'),
	# path('chat/<username>', get_or_create_chatroom, name="start_chat"),
	path('chat/room/<chatroom_name>', chatView.chat_view.as_view(), name="chat_view"),
	path('add_user/', add_new_user.as_view(), name='add_user'),
	path('check_username/', check_username.as_view(), name='check_username'),
	path('get_chatrooms/', getChatroomsView.getChatroomsView.as_view(), name='get_chatrooms'),
	path('find_matching_chatroom/', findMatchingChatroomView.findMatchingChatroomView.as_view(), name='find_matching_chatroom'),
]
