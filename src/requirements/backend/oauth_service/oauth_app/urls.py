from django.urls import path

from .views import oauth_login

urlpatterns = [
    path('login/',oauth_login.oauthLoginView.as_view(), name='oauthLogin'),
]
