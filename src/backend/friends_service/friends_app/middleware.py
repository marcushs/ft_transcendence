from .utils.jwt_utils import get_user_from_jwt
from django.utils.deprecation import MiddlewareMixin # assure the retro-compability for recent django middleware
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.conf import settings

User = get_user_model()
# Middleware for jwt authentication

from .utils.user_utils import send_request
class JWTAuthMiddleware(MiddlewareMixin):
    async def process_request(self, request):
        token = request.COOKIES.get('jwt')
        if token:
            jwt_user = await get_user_from_jwt(token)
            if jwt_user == 'expired':
                self.send_new_token_request(request=request, jwt_user=jwt_user)
            elif jwt_user == None: 
                request.jwt_failed = True
                request.user = AnonymousUser()
            else:
                request.user = jwt_user
        else:
            refresh_token = request.COOKIES.get('jwt_refresh')
            if refresh_token:
                jwt_user = await get_user_from_jwt(refresh_token)
                if jwt_user == 'expired' or jwt_user == None:
                    request.jwt_failed = True
                    request.user = AnonymousUser()
                else:
                    self.send_new_token_request(request=request, jwt_user=jwt_user)
            else:
                    request.user = AnonymousUser() 
        response = self.get_response(request) 
        return response 
    
    def send_new_token_request(self, request, jwt_user):
        try:
            request_response = send_request(request_type='GET',request=request, url='http://auth:8000/auth/update-tokens/')
            if request_response and request_response.cookies:
                request.new_token = request_response.cookies.get('jwt')
                request.new_token_refresh =  request_response.cookies.get('jwt_refresh')
                request.user = jwt_user
            else:
                request.user = AnonymousUser()
        except Exception:
            request.jwt_failed = True
            request.user = AnonymousUser() 
    
    def process_response(self, request, response): 
        if hasattr(request, 'jwt_failed'):
            response = JsonResponse({'error': 'invalid session token'}, status=401)
            response.delete_cookie('jwt')
            response.delete_cookie('jwt_refresh')
        if hasattr(request, 'new_token'):
            response.set_cookie('jwt', request.new_token, httponly=True, max_age=settings.ACCESS_TOKEN_LIFETIME)
        if hasattr(request, 'new_token_refresh'):
            response.set_cookie('jwt_refresh', request.new_token_refresh, httponly=True, max_age=settings.REFRESH_TOKEN_LIFETIME)
        return response

