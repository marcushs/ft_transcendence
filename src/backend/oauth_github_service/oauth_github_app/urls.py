from django.urls import path

from .views import oauth_github_authorization, oauth_github_redirect, oauth_github_access_resource, oauth_github_update_username

urlpatterns = [
    path('auth/',oauth_github_authorization.oauthGithubAuthorizationView.as_view(), name='oauthGithubAuthorization'),
    path('redirect/',oauth_github_redirect.oauthGithubRedirectView.as_view(), name='oauthGithubRedirect'),
    path('access_resource/',oauth_github_access_resource.oauthGithubAccessResourceView.as_view(), name='oauthGithubAccessResource'),
    path('update_username/',oauth_github_update_username.oauthGithubUpdateUsernameView.as_view(), name='oauthGithubUpdateUsername'),
]
