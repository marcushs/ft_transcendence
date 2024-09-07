from django.utils.deprecation import MiddlewareMixin # assure the retro-compability for recent django middleware
from django.contrib.auth.models import AnonymousUser
from .utils.jwt_utils import get_user_from_jwt
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
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
                # call endpoint auth here to get new token from refresh_token
                pass
            elif jwt_user == None:
                request.jwt_failed = True
                request.user = AnonymousUser()
            else:
                request.user = jwt_user
        else:
            refresh_token = request.COOKIES.get('jwt_refresh')
            if refresh_token:
                jwt_user = get_user_from_jwt(refresh_token)
                if jwt_user == 'expired' or jwt_user == None:
                    request.jwt_failed = True
                    request.user = AnonymousUser()
                    pass
                else:
                    # call endpoint auth here to get new token from refresh_token
                    pass
            else:
                    request.user = AnonymousUser()
        response = self.get_response(request)
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
            threshold = timezone.now() - timedelta(minutes=2)
        else:
            threshold = timezone.now() - timedelta(minutes=15)
        for user in users:
            if user.last_active < threshold:
                user.status = status_change
                user.save()