from django.urls import path

from .views import chatView
from .utils.user_utils import add_new_user, check_username


urlpatterns = [
    path('chat_view/', chatView.chat_view.as_view(), name='chat_view'),
	# path('chat/<username>', get_or_create_chatroom, name="start_chat"),
	path('chat/room/<chatroom_name>', chatView.chat_view.as_view(), name="chat_view"),
	path('add_user/', add_new_user.as_view(), name='add_user'),
	path('check_username/', check_username.as_view(), name='check_username'),
]
