from django.urls import path

from .utils import csrf_utils
from . import views
from .utils import user_utils, change_user_infos, language

urlpatterns = [
	path('', views.index, name='index'),
    path('csrf/', csrf_utils.generate_csrf_token, name='csrf'),
    path('user_info/', views.get_information_view, name='user_info'),
	path('language/', language.language_view.as_view(), name='language'),
    path('add_user/', user_utils.add_new_user.as_view(), name='add_user'),
    path('update_user/', user_utils.update_user.as_view(), name='update_user'),
	path('change-user-infos/', change_user_infos.ChangeUserInfosView.as_view(), name='change-user-infos'),
    path('search_users/', user_utils.searchUsers.as_view(), name='search_users'),
    path('get_user/', user_utils.getUserInfos.as_view(), name='get_user'),
    path('get_user_by_id/', user_utils.getUserInfosById.as_view(), name='get_user'),
    path('get_user_id/', user_utils.getUserId.as_view(), name='get_user_id'),
    path('get_username_by_id/', user_utils.getUsernameById.as_view(), name='get_user_id'),
    path('get_users_info/', user_utils.getUsersInfo.as_view(), name='get_users_info'),
    path('ping_status/', user_utils.ping_status_user.as_view(), name='ping_status'),
    path('set_offline/', user_utils.set_offline_user.as_view(), name='set_offline'),
    path('user_game_info/', user_utils.getUserGameInfo.as_view(), name='user_game_info'),
    
]