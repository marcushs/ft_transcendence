from django.urls import path

from .views import oauth_42_authorization, oauth_42_redirect, oauth_42_access_resource

urlpatterns = [
    path('auth/',oauth_42_authorization.oauth42AuthorizationView.as_view(), name='oauth42Authorization'),
    path('redirect/',oauth_42_redirect.oauth42RedirectView.as_view(), name='oauth42Redirect'),
    path('access_resource/',oauth_42_access_resource.oauth42AccessResourceView.as_view(), name='oauth42AccessResource'),
]
