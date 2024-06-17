from django.contrib.auth.models import AnonymousUser
from django.utils.deprecation import MiddlewareMixin # assure the retro-compability for recent django middleware
from .jwt_auth import getUserFromJwtToken

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
            request.jwt_user = AnonymousUser()
        response = self.get_response(request)
        return response

# define jwt authentication as default user auth by overriding request.user
class MixedAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.jwt_user:
            request.user = request.jwt_user