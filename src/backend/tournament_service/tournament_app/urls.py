from django.urls import path

from .utils.user_utils import add_new_user, check_username

urlpatterns = [
	path('add_user/', add_new_user.as_view(), name='add_user'),
	path('check_username/', check_username.as_view(), name='check_username'),
]
