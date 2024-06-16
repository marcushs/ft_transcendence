from django.urls import include, path
from . import views
from . import jwt_auth

urlpatterns = [
	path('', views.index, name='index'),
	path('login/', views.login, name='login'),
	path('signup/', views.signup, name='signup'),
 	path('logout/', views.logout, name="logout"),
  	path('protected/', jwt_auth.protectedView, name='protected'), # view for jwt test
]
