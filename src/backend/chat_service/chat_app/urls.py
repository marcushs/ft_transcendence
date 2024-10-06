from django.urls import path

from .views import chatView


urlpatterns = [
    path('chat_view/', chatView.chat_view.as_view(), name='chat_view'),
	# path('chat/<username>', get_or_create_chatroom, name="start_chat"),
	path('chat/room/<chatroom_name>', chatView.chat_view.as_view(), name="chat_view"),
]
