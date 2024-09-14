from django.urls import path

from .views import login, logout, signup, get_jwt_token
from .utils import csrf_utils, user_utils, change_password

urlpatterns = [
    path('csrf/', csrf_utils.generate_csrf_token, name='csrf'),
	path('login/', login.login_view.as_view(), name='login'),
 	path('logout/', logout.logout_view.as_view(), name="logout"),
	path('signup/', signup.signup_view.as_view(), name='signup'),
    path('update_user/', user_utils.update_user.as_view(), name='update_user'),
  	path('change-password/', change_password.ChangePassword.as_view(), name='change-password'),
  	path('jwt/', get_jwt_token.get_jwt_token_view.as_view(), name='jwt')
]
