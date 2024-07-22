from django.urls import path

from .utils import csrf_utils
from . import views

urlpatterns = [
	path('', views.index, name='index'),
    path('csrf/', csrf_utils.generate_csrf_token, name='csrf'),
    path('user_info/', views.get_information_view, name='user_info'),
    path('add_user/', views.add_new_user.as_view(), name='add_user'),
]
