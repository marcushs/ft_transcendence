from django.urls import path

from .views import login, logout, signup
from .utils import csrf_utils, user_utils, change_password

urlpatterns = [
    path('csrf/', csrf_utils.generate_csrf_token, name='csrf'),
	path('login/', login.login_view.as_view(), name='login'),
 	path('logout/', logout.logout_view.as_view(), name="logout"),
	path('signup/', signup.signup_view.as_view(), name='signup'),
    path('update_user/', user_utils.update_user.as_view(), name='update_user'),
  	path('change-password/', change_password.ChangePassword.as_view(), name='change-password'),
    path('add_oauth_user/', user_utils.add_oauth_user.as_view(), name='add_oauth_user'),
    path('check_username/', user_utils.check_username.as_view(), name='check_username'),
]
