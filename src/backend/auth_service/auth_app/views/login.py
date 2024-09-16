from ..utils.jwt_utils import create_jwt_token
from django.http import JsonResponse
from django.conf import settings
from django.views import View
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.hashers import check_password
from .send_post_request import send_post_request_with_token, send_post_request_without_token
from django.contrib.auth import get_user_model
import json
 
User = get_user_model()
class login_view(View):
    def __init__(self):
        super().__init__
    
    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        if 'logged_in_with_oauth' in data and data['logged_in_with_oauth'] is True:
            print('oauth login')
            return self._oauth_login(request, data)
        if 'twofactor' in data:
            return self._send_twofactor_request(data=data, csrf_token=request.headers.get('X-CSRFToken'), request=request)
        response = self._check_data(request=request, data=data)
        if response is not None:
            return response
        try:
            user = User.objects.get(username=data['username'])
            if check_password(data['password'], user.password):
                if user.is_verified is True:
                    return JsonResponse({'message': '2FA activated on this account, need to verify before log', 'is_verified': user.is_verified, 'two_factor_method': user.two_factor_method, 'email': user.email}, status=200)
                response = self._create_user_session(user=user, request=request)
            else:
                response = JsonResponse({'message': 'Invalid password, please try again'}, status=400)
        except User.DoesNotExist:
            response = JsonResponse({'message': 'This username does not exist, please try again'}, status=400)
        return response
    
    def _oauth_login(self, request, data):
        if 'twofactor' in data:
            return self._send_twofactor_request(data=data, csrf_token=request.headers.get('X-CSRFToken'))
        if request.COOKIES.get('jwt'):
            return JsonResponse({'message': 'You are already logged in'}, status=400)
        try:
            user = User.objects.get(username=data['username']) 
            if user.is_verified is True:
                return JsonResponse({'message': '2FA activated on this account, need to verify before log', 'is_verified': user.is_verified}, status=200)
            response = self._create_user_session(user=user)
        except User.DoesNotExist:
            response = JsonResponse({'message': 'Invalid username, please try again'}, status=400)
        return response
    
    def _check_data(self, request, data):
        if not data['username']:
            return JsonResponse({'message': 'No username provided'}, status=400)
        if not data['password']:
            return JsonResponse({'message': 'No password provided'}, status=400)
        if request.COOKIES.get('jwt'):
            return JsonResponse({'message': 'You are already logged in'}, status=400)
        return None
    

    def _create_user_session(self, user, request):
        token = create_jwt_token(user, 'access')
        refresh_token = create_jwt_token(user, 'refresh')
        response = JsonResponse({'message': 'Login successfully'}, status=200)
        response.set_cookie('jwt', token, httponly=True, max_age=settings.JWT_EXP_DELTA_SECONDS)
        response.set_cookie('jwt_refresh', refresh_token, httponly=True, max_age=settings.JWT_REFRESH_EXP_DELTA_SECONDS)
        payload = {
            'status': 'online',
            'last_active': '',
        }
        send_post_request_with_token(request=request, url='http://user:8000/user/update_user/', payload=payload, jwt=token, jwt_refresh=refresh_token)
        return response

    def _send_twofactor_request(self, data, csrf_token, request):
        try:
            user = User.objects.get(username=data['username'])
            response = send_post_request_without_token(url='http://twofactor:8000/twofactor/twofactor_login/', payload=data, csrf_token=csrf_token)
            if response.status_code != 200:
                return response
            return self._create_user_session(user=user, request=request)
        except ObjectDoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
