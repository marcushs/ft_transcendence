from .utils.jwt_utils import get_user_from_jwt, Refresh_jwt_token
from django.utils.deprecation import MiddlewareMixin # assure the retro-compability for recent django middleware
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.conf import settings
from datetime import timedelta
from django.utils import timezone

User = get_user_model()

# Middleware for jwt authentication
class JWTAuthMiddleware(MiddlewareMixin):
    def process_request(self, request):
        token = request.COOKIES.get('jwt')
        if token:
            jwt_user = get_user_from_jwt(token)
            if jwt_user:
                request.user = jwt_user
            else:
                request.jwt_failed = True
                request.user = AnonymousUser()
        else:
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
        response = self.get_response(request)
        return response
    

    def process_response(self, request, response):
        if hasattr(request, 'jwt_failed'):
            response = JsonResponse({'message': 'session has expired, please log in again'}, status=401)
            response.delete_cookie('jwt')
            response.delete_cookie('jwt_refresh')
        if hasattr(request, 'new_jwt'):
            response.set_cookie('jwt', request.new_jwt, httponly=True, max_age=settings.JWT_EXP_DELTA_SECONDS)
        if hasattr(request, 'new_jwt_refresh'):
            response.set_cookie('jwt_refresh', request.new_jwt_refresh, httponly=True, max_age=settings.JWT_REFRESH_EXP_DELTA_SECONDS)
        return response

 
class UserStatusMiddleware(MiddlewareMixin):
    def process_request(self, request):
        online_users = list(User.objects.filter(status='online'))
        self.set_new_users_status(online_users, status_change='away')
        away_users = list(User.objects.filter(status='away'))
        self.set_new_users_status(away_users, status_change='offline')
        response = self.get_response(request)
        return response
    
    def set_new_users_status(self, users, status_change):
        if status_change == 'away':
            threshold = timezone.now() - timedelta(minutes=2, seconds=30)
        else:
            threshold = timezone.now() - timedelta(minutes=10)
        for user in users:
            if user.last_active < threshold:
                user.status = status_change
                user.save()