from .jwt_utils import getUserFromJwtToken, RefreshJwtToken
from django.utils.deprecation import MiddlewareMixin # assure the retro-compability for recent django middleware
from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.conf import settings

# Middleware for jwt authentication
class JWTAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        token = request.COOKIES.get('jwt')
        if token:
            user = getUserFromJwtToken(token)
            if user:
                request.jwt_user = user # Associates user with the request
            else:
                request.jwt_failed = True
                request.jwt_user = AnonymousUser()
        else:
            refresh_token = request.COOKIES.get('jwt_refresh')
            if refresh_token:
                user = getUserFromJwtToken(refresh_token)
                if user:
                    token = RefreshJwtToken(refresh_token, 'access')
                    request.new_jwt = token
                    token_refresh = RefreshJwtToken(refresh_token, 'refresh')
                    request.new_jwt_refresh = token_refresh
                    request.jwt_user = user
                else:
                    request.jwt_failed = True
                    request.jwt_user = AnonymousUser()
            else:
                    request.jwt_user = AnonymousUser()
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

# define jwt authentication as default user auth by overriding request.user
class MixedAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # isAuth = request.COOKIES.get('authentificated')
        # if hasattr(request, 'jwt_failed') and isAuth is not None:
        #     response = JsonResponse({'error': 'token expired, please login again', 'status': 'jwt_failed'}, status=401)
        #     response.delete_cookie('authentificated')
        #     return response
        if hasattr(request, 'jwt_user'):
            request.user = request.jwt_user