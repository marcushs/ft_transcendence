from django.urls import path

from .views import login, logout, signup
from .twofactor import two_factor_enable, two_factor_disable, two_factor_send_token
from .utils import csrf_utils, two_factor_utils

urlpatterns = [
    path('csrf/', csrf_utils.generate_csrf_token, name='csrf'),
	path('login/', login.login_view.as_view(), name='login'),
 	path('logout/', logout.logout_view.as_view(), name="logout"),
	path('signup/', signup.signup_view.as_view(), name='signup'),
    path('twofactor/enable/', two_factor_enable.twofactor_enable_view.as_view(), name='enable2fa'),
    path('twofactor/disable/', two_factor_disable.twofactor_disable_view.as_view(), name='disable2fa'),
    path('twofactor/get_2fa_code/', two_factor_send_token.twofactor_send_token_view.as_view(), name='get2faCode'),
    path('twofactor/status/', two_factor_utils.twofactor_get_status_view.as_view(), name='user_status'),
]
