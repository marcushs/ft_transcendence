from django.urls import path

from .views import getChatroomsView, findMatchingChatroomView, getLast20MessagesView, getChatroomLastMessageView, getChatroomInfoView, blockUserView
from .utils.user_utils import AddNewUser


urlpatterns = [
	path('add_user/', AddNewUser.as_view(), name='add_user'),
	path('get_chatrooms/', getChatroomsView.getChatroomsView.as_view(), name='get_chatrooms'),
	path('find_matching_chatroom/', findMatchingChatroomView.findMatchingChatroomView.as_view(), name='find_matching_chatroom'),
	path('get_last_20_messages/', getLast20MessagesView.getLast20MessagesView.as_view(), name="get_last_20_messages"),
	path('get_chatroom_last_message/', getChatroomLastMessageView.getChatroomLastMessageView.as_view(), name="get_last_20_messages"),
	path('get_chatroom_info/', getChatroomInfoView.getChatroomInfoView.as_view(), name="get_chatroom_info"),
	path('block_user/', blockUserView.blockUserView.as_view(), name="block_user"),
	path('unblock_user/', blockUserView.unblockUserView.as_view(), name="unblock_user"),
	path('is_user_blocked/', blockUserView.isUserBlockedView.as_view(), name="is_user_blocked"),
]
