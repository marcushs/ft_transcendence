from .auth import csrf_utils, login, logout, signup, two_factor_auth
from django.urls import path
from . import views
from . import change_user_infos
from . import change_password

urlpatterns = [
    path('csrf/', csrf_utils.generate_csrf_token, name='csrf'),
	path('', views.index, name='index'),
	path('login/', login.loginView.as_view(), name='login'),
	path('signup/', signup.signupView.as_view(), name='signup'),
 	path('logout/', logout.logoutView.as_view(), name="logout"),
  	path('protected/', views.protectedView, name='protected'), # view for jwt test
  	path('change-password/', change_password.ChangePassword.as_view(), name='change-password'),
	path('change-user-infos/', change_user_infos.ChangeUserInfosView.as_view(), name='change-user-infos'),
    path('2fa/enable/', two_factor_auth.twoFactorEnableView.as_view(), name='enable2fa'),
    path('2fa/disable/', two_factor_auth.twoFactorDisableView.as_view(), name='disable2fa'),
    path('2fa/backup/', two_factor_auth.twoFactorBackupView.as_view(), name='backup2fa'),
]
