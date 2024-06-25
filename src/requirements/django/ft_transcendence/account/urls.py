from django.urls import include, path
from . import views

urlpatterns = [
    path('csrf/', views.generateCsrfToken, name='csrf'),
	path('', views.index, name='index'),
	path('login/', views.login, name='login'),
	path('signup/', views.signup, name='signup'),
 	path('logout/', views.logout, name="logout"),
  	path('protected/', views.protectedView, name='protected'), # view for jwt test
]
	