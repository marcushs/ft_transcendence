from django.contrib.auth.models import AnonymousUser
from django.utils.deprecation import MiddlewareMixin # assure the retro-compability for recent django middleware
from .jwt_auth import getUserFromJwtToken, RefreshJwtToken
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
                request.jwt_user = AnonymousUser()                
        else:
            refresh_token = request.COOKIES.get('jwt_refresh')
            print('refresh token: ', refresh_token)
            if refresh_token:
                user = getUserFromJwtToken(refresh_token)
                if user:
                    token = RefreshJwtToken(refresh_token)
                    request.refreshed_jwt = token
                    request.jwt_user = user
                else:
                    request.jwt_user = AnonymousUser()
                    print('le flop - 1')
            else:
                request.jwt_user = AnonymousUser()
        response = self.get_response(request)
        return response

    def process_response(self, request, response):
        if hasattr(request, 'refreshed_jwt'):
            response.set_cookie('jwt', request.refreshed_jwt, httponly=True, max_age=settings.JWT_EXP_DELTA_SECONDS)
        return response

# define jwt authentication as default user auth by overriding request.user
class MixedAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.jwt_user:
            request.user = request.jwt_user