from .jwt_utils import getUserFromJwtToken, RefreshJwtToken
from django.utils.deprecation import MiddlewareMixin # assure the retro-compability for recent django middleware
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.conf import settings

User = get_user_model()

# Middleware for jwt authentication
class JWTAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        token = request.COOKIES.get('jwt')
        if token:
            jwt_user = getUserFromJwtToken(token)
            if jwt_user:
                request.user = jwt_user
            else:
                request.jwt_failed = True
                request.user = AnonymousUser()
        else:
            refresh_token = request.COOKIES.get('jwt_refresh')
            if refresh_token:
                jwt_user = getUserFromJwtToken(refresh_token)
                if jwt_user:
                    token = RefreshJwtToken(refresh_token, 'access')
                    request.new_jwt = token
                    token_refresh = RefreshJwtToken(refresh_token, 'refresh')
                    request.new_jwt_refresh = token_refresh
                    request.user = jwt_user
                else:
                    request.jwt_failed = True
                    request.user = AnonymousUser()
            else:
                    request.user = AnonymousUser()
        response = self.get_response(request)
        return response
    

    def process_response(self, request, response):
        if hasattr(request, 'jwt_failed'):
            response = JsonResponse({'error': 'invalid session token'}, status=401)
            response.delete_cookie('jwt')
            response.delete_cookie('jwt_refresh')
        if hasattr(request, 'new_jwt'):
            response.set_cookie('jwt', request.new_jwt, httponly=True, max_age=settings.JWT_EXP_DELTA_SECONDS)
        if hasattr(request, 'new_jwt_refresh'):
            response.set_cookie('jwt_refresh', request.new_jwt_refresh, httponly=True, max_age=settings.JWT_REFRESH_EXP_DELTA_SECONDS)
        return response
