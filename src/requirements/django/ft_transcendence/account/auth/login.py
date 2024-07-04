from django.contrib.auth import authenticate
from .jwt_utils import createJwtToken
from django.http import JsonResponse
from django.conf import settings
from django.views import View
from django.contrib.auth.hashers import check_password
from ..models import User
import json

class loginView(View):
    def __init__(self):
        super().__init__
    
    
    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        response = self._check_data(request, data)
        if response is not None:
            return response
        try:
            user = User.objects.get(username=data['username'])
            if check_password(data['password'], user.password):
                response = self._create_user_session(user)
            else:
                response = JsonResponse({'error': 'Invalid password, please try again'}, status=400)
        except User.DoesNotExist:
            response = JsonResponse({'error': 'Invalid username, please try again'}, status=400)
        return response
    
    
    def _check_data(self, request, data):
        if not data['username']:
            return JsonResponse({'error': 'No username provided'}, status=401)
        if not data['password']:
            return JsonResponse({'error': 'No password provided'}, status=401)
        if request.COOKIES.get('jwt'):
            return JsonResponse({'error': 'You are already logged in'}, status=401)
        return None
    
    
    def _create_user_session(self, user):
        token = createJwtToken(user, 'access')
        refresh_token = createJwtToken(user, 'refresh')
        response = JsonResponse({'message': 'Login successfully', 'redirect_url': 'profile'}, status=201)
        response.set_cookie('jwt', token, httponly=True, max_age=settings.JWT_EXP_DELTA_SECONDS)
        response.set_cookie('jwt_refresh', refresh_token, httponly=True, max_age=settings.JWT_REFRESH_EXP_DELTA_SECONDS)
        return response
