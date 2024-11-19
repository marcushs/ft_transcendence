from django.urls import path

from .views import oauth_google_authorization, oauth_google_redirect, oauth_google_access_resource, oauth_google_update_username, IsLoggedWithGoogle

urlpatterns = [
    path('access_resource/',oauth_google_access_resource.oauthGoogleAccessResourceView.as_view(), name='oauthGoogleAccessResource'),
    path('update_username/',oauth_google_update_username.oauthGoogleUpdateUsernameView.as_view(), name='oauthGoogleUpdateUsername'),
    path('auth/',oauth_google_authorization.oauthGoogleAuthorizationView.as_view(), name='oauthGoogleAuthorization'),
    path('is_auth/', IsLoggedWithGoogle.IsLoggedWithGoogle.as_view(), name='is_auth'),
    path('redirect/',oauth_google_redirect.oauthGoogleRedirectView.as_view(), name='oauthGoogleRedirect'),
]

