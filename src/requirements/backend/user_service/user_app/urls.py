from django.urls import path

from .utils import csrf_utils
from . import views
from .utils import user_utils, change_user_infos
from .views import searchUsers

urlpatterns = [
	path('', views.index, name='index'),
    path('csrf/', csrf_utils.generate_csrf_token, name='csrf'),
    path('user_info/', views.get_information_view, name='user_info'),
    path('add_user/', user_utils.add_new_user.as_view(), name='add_user'),
    path('update_user/', user_utils.update_user.as_view(), name='update_user'),
	path('change-user-infos/', change_user_infos.ChangeUserInfosView.as_view(), name='change-user-infos'),
    path('search_users/', searchUsers.as_view(), name='search_users'),
]
 