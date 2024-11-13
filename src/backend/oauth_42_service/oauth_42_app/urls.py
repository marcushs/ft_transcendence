from django.urls import path

from .views import oauth_42_authorization, oauth_42_redirect, oauth_42_access_resource, oauth_42_update_username, get_42_image_view, is_logged_with_42

urlpatterns = [
    path('auth/',oauth_42_authorization.oauth42AuthorizationView.as_view(), name='oauth42Authorization'),
    path('redirect/',oauth_42_redirect.oauth42RedirectView.as_view(), name='oauth42Redirect'),
    path('access_resource/',oauth_42_access_resource.oauth42AccessResourceView.as_view(), name='oauth42AccessResource'),
    path('update_username/',oauth_42_update_username.oauth42UpdateUsernameView.as_view(), name='oauth42UpdateUsername'),
    path('get_image/',get_42_image_view.get42ImageView.as_view(), name='get_image'),
    path('is_logged_with_42/',is_logged_with_42.is_logged_with_42.as_view(), name='is_logged_with_42'),
]
