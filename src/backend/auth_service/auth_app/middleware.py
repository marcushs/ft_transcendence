from .utils.jwt_utils import get_user_from_jwt, Refresh_jwt_token
from django.utils.deprecation import MiddlewareMixin # assure the retro-compability for recent django middleware
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.conf import settings

User = get_user_model()
 
# Middleware for jwt authentication
class JWTAuthMiddleware(MiddlewareMixin):
    def process_request(self, request):
        token = request.COOKIES.get('jwt')
        if token:
            jwt_user = get_user_from_jwt(token)
            if jwt_user == 'expired':
                request = self.refresh_jwt_token_process(request)
            elif jwt_user is None:
                request.jwt_failed = True
                request.user = AnonymousUser()
            request.user = jwt_user
        else:
            request = self.refresh_jwt_token_process(request)
        response = self.get_response(request)
        return response

    def refresh_jwt_token_process(self, request):
        refresh_token = request.COOKIES.get('jwt_refresh')
        if refresh_token: 
            jwt_user = get_user_from_jwt(refresh_token)
            if jwt_user:
                token = Refresh_jwt_token(refresh_token, 'access')
                request.new_jwt = token
                token_refresh = Refresh_jwt_token(refresh_token, 'refresh')
                request.new_jwt_refresh = token_refresh
                request.user = jwt_user
            else:
                request.jwt_failed = True
                request.user = AnonymousUser()
        else:
                request.user = AnonymousUser()
        return request

    def process_response(self, request, response):
        if hasattr(request, 'jwt_failed'):
            response = JsonResponse({'error': 'invalid session token'}, status=401)
            response.delete_cookie('jwt')
            response.delete_cookie('jwt_refresh')
        if hasattr(request, 'new_jwt'):
            response.set_cookie('jwt', request.new_jwt, httponly=True, max_age=settings.ACCESS_TOKEN_LIFETIME)
        if hasattr(request, 'new_jwt_refresh'):
            response.set_cookie('jwt_refresh', request.new_jwt_refresh, httponly=True, max_age=settings.REFRESH_TOKEN_LIFETIME)
        return response
