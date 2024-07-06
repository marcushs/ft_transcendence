from .jwt_utils import createJwtToken
from django.http import JsonResponse
from django.conf import settings
from django.views import View
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from django.contrib.auth import get_user_model
import pyotp
import json

User = get_user_model()
class loginView(View):
    def __init__(self):
        super().__init__
    
    
    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        if 'twofactor' in data:
            return self._two_factor_login_check(data)
        response = self._check_data(request, data)
        if response is not None:
            return response
        try:
            user = User.objects.get(username=data['username'])
            if check_password(data['password'], user.password):
                if user.is_verified is True:
                    return JsonResponse({'message': '2FA activated on this account, need to verify before log', 'is_verified': user.is_verified}, status=200)
                response = self._create_user_session(user)
            else:
                response = JsonResponse({'message': 'Invalid password, please try again'}, status=400)
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
    
    
    def _create_user_session(self, user):
        token = createJwtToken(user, 'access')
        refresh_token = createJwtToken(user, 'refresh')
        response = JsonResponse({'message': 'Login successfully', 'redirect_url': 'profile'}, status=200)
        response.set_cookie('jwt', token, httponly=True, max_age=settings.JWT_EXP_DELTA_SECONDS)
        response.set_cookie('jwt_refresh', refresh_token, httponly=True, max_age=settings.JWT_REFRESH_EXP_DELTA_SECONDS)
        return response
    
    def _two_factor_login_check(self, data):
        user = User.objects.get(username=data['username'])
        code = data.get('twofactor')
        if not code:
                return JsonResponse({'message': 'Verification code missing'}, status=400)
        if user.two_factor_method == 'authenticator':
            totp = pyotp.TOTP(user.authenticator_secret)
            if not totp.verify(code):
                return JsonResponse({'message': 'Invalid verification code'}, status=400)
        elif user.two_factor_method == 'email':
            if user.two_factor_code != code or user.two_factor_code_expiry < timezone.now():
                return JsonResponse({'message': 'Invalid verification code'}, status=400)
        else:
            return JsonResponse({'message': 'We\'ve encountered an issue with the verification method.'}, status=400)
        print('user: ', user)
        return self._create_user_session(user)
