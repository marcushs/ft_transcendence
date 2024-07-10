from .auth import csrf_utils, login, logout, signup, two_factor_auth
from django.urls import path
from . import views

urlpatterns = [
    path('csrf/', csrf_utils.generate_csrf_token, name='csrf'),
	path('', views.index, name='index'),
	path('login/', login.loginView.as_view(), name='login'),
	path('signup/', signup.signupView.as_view(), name='signup'),
 	path('logout/', logout.logoutView.as_view(), name="logout"),
    path('2fa/enable/', two_factor_auth.twoFactorEnableView.as_view(), name='enable2fa'),
    path('twofactor/status/', two_factor_auth.get_two_factor_status_view.as_view(), name='user_status'),
    path('2fa/disable/', two_factor_auth.twoFactorDisableView.as_view(), name='disable2fa'),
    path('2fa/get_2fa_code/', two_factor_auth.getTwoFactorCodeView.as_view(), name='get2faCode'),
    path('user_info/', views.getInformationView, name='userInfo'),
]
