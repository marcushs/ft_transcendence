from django.urls import path

from .views import login, logout, signup
from .utils import csrf_utils, user_utils

urlpatterns = [
    path('csrf/', csrf_utils.generate_csrf_token, name='csrf'),
	path('login/', login.login_view.as_view(), name='login'),
 	path('logout/', logout.logout_view.as_view(), name="logout"),
	path('signup/', signup.signup_view.as_view(), name='signup'),
    path('update_user/', user_utils.update_user.as_view(), name='update_user')
]
