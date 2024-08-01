from django.urls import path

from .views import oauth_login, oauth_redirect, oauth_access_resource

urlpatterns = [
    path('login/',oauth_login.oauthLoginView.as_view(), name='oauthLogin'),
    path('redirect/',oauth_redirect.oauthRedirectView.as_view(), name='oauthRedirect'),
    path('access_resource/',oauth_access_resource.oauthAccessResourceView.as_view(), name='oauthAccessResource'),
]
