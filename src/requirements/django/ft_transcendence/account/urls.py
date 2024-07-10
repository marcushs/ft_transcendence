from .auth import csrf_utils, login, logout, signup, two_factor_auth
from django.urls import path
from . import views

urlpatterns = [
    path('csrf/', csrf_utils.generate_csrf_token, name='csrf'),
	path('', views.index, name='index'),
	path('login/', login.login_view.as_view(), name='login'),
	path('signup/', signup.signup_view.as_view(), name='signup'),
 	path('logout/', logout.logout_view.as_view(), name="logout"),
    path('twofactor/enable/', two_factor_auth.twofactor_enable_view.as_view(), name='enable2fa'),
    path('twofactor/disable/', two_factor_auth.twofactor_disable_view.as_view(), name='disable2fa'),
    path('twofactor/get_2fa_code/', two_factor_auth.twofactor_get_code_view.as_view(), name='get2faCode'),
    path('twofactor/status/', two_factor_auth.twofactor_get_status_view.as_view(), name='user_status'),
    path('user_info/', views.get_information_view, name='userInfo'),
]
