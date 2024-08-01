from django.views import View
from django.http import JsonResponse
from django.utils import timezone
from django.contrib.auth.models import AnonymousUser
from .two_factor_utils import send_update_request

import pyotp
import json

class twofactor_disable_view(View):
    def __init__(self):
        super().__init__
    
    
    def post(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'User not found'}, status=401)
        if request.user.is_verified == False:
            return JsonResponse({'message': 'Two factor authentification not set on your account'}, status=400)
        data = json.loads(request.body.decode('utf-8'))
        code = data.get('twofactor')
        if not code:
                return JsonResponse({'message': 'Verification code missing'}, status=400)
        if request.user.two_factor_method == 'authenticator':
            totp = pyotp.TOTP(request.user.authenticator_secret)
            if not totp.verify(code):
                return JsonResponse({'message': 'Invalid verification code'}, status=400)
        elif request.user.two_factor_method == 'email':
            if request.user.two_factor_code != code or request.user.two_factor_code_expiry < timezone.now():
                return JsonResponse({'message': 'Invalid verification code'}, status=400)
        else:
            return JsonResponse({'message': 'We\'ve encountered an issue with the verification method.'}, status=400)
        request.user.authenticator_secret = None
        request.user.two_factor_method = ''
        request.user.is_verified = False
        response = send_update_request(request=request)
        if response.status_code != 200:
            return response
        request.user.save()
        return JsonResponse({'message': 'Two factor authentication successfully disabled'}, status=200)