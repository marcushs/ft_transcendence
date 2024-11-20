from django.urls import path

from .views import two_factor_enable, two_factor_disable, two_factor_send_token, two_factor_utils, two_factor_login
from .utils import user_utils

urlpatterns = [
    path('delete_user/', user_utils.DeleteUser.as_view(), name='delete_user'),
    path('enable/', two_factor_enable.twofactor_enable_view.as_view(), name='enable2fa'),
    path('disable/', two_factor_disable.twofactor_disable_view.as_view(), name='disable2fa'),
    path('get_2fa_code/', two_factor_send_token.twofactor_send_token_view.as_view(), name='get2faCode'),
    path('status/', two_factor_utils.twofactor_get_status_view.as_view(), name='user_status'),
    path('add_user/', user_utils.AddNewUser.as_view(), name='add_user'),
    path('update_user/', user_utils.update_user.as_view(), name='update_user'),
    path('twofactor_login/', two_factor_login.two_factor_login_check.as_view(), name='twofactor_login'),
]
