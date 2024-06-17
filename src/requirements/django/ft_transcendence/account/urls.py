from django.urls import include, path
from . import views

urlpatterns = [
	path('', views.index, name='index'),
	path('login/', views.login_view, name='login'),
	path('signup/', views.signup, name='signup'),
	path('welcome/', views.welcome, name='welcome'),
]
