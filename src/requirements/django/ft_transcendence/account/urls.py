from .auth import csrf_utils, login, logout, signup
from django.urls import path
from . import views

urlpatterns = [
    path('csrf/', csrf_utils.generate_csrf_token, name='csrf'),
	path('', views.index, name='index'),
	path('login/', login.loginView.as_view(), name='login'),
	path('signup/', signup.signupView.as_view(), name='signup'),
 	path('logout/', logout.logoutView.as_view(), name="logout"),
  	path('protected/', views.protectedView, name='protected'), # view for jwt test
]