from django.urls import path

from .views import oauth_google_login, oauth_google_redirect, oauth_google_access_resource

urlpatterns = [
    path('login/',oauth_google_login.oauthGoogleLoginView.as_view(), name='oauthGoogleLogin'),
    path('redirect/',oauth_google_redirect.oauthGoogleRedirectView.as_view(), name='oauthGoogleRedirect'),
    path('access_resource/',oauth_google_access_resource.oauthGoogleAccessResourceView.as_view(), name='oauthGoogleAccessResource'),
]
