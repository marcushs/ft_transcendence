from django.urls import path

from .views import oauth_signup

urlpatterns = [
    path('signup/',oauth_signup.oauthSignupView.as_view(), name='oauthSignup'),
]
