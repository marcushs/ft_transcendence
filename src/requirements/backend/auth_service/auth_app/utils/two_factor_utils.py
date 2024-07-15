from django.http import JsonResponse
from django.utils import timezone
from django.views import View
from django.contrib.auth.models import AnonymousUser

import pyotp

def twofactor_verify_view(request, two_factor_code, two_factor_method):
    if two_factor_method == 'authenticator':
        totp = pyotp.TOTP(request.user.authenticator_secret)
        if not totp.verify(two_factor_code):
            return JsonResponse({'message': 'Invalid Twofactor code'}, status=400)
    elif two_factor_method == 'email':
        if request.user.two_factor_code != two_factor_code:
            return JsonResponse({'message': 'Invalid Twofactor code'}, status=400)
        if request.user.two_factor_code_expiry < timezone.now():
            return JsonResponse({'message': 'Expired Twofactor code'}, status=400)
    else:
        return JsonResponse({'message': 'We\'ve encountered an issue with the TwoFactor method.'}, status=400)
    return JsonResponse({'message': 'successful two-factor authentication'}, status=200)

class twofactor_get_status_view(View):
    def __init__(self):
        super().__init__
    
    
    def get(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'you are not logged in'}, status=401)
        if request.user.is_verified == True:
            return JsonResponse({'message': 'you have setup twofactor on your account', 'is_verified': True}, status=200)
        else:
            return JsonResponse({'message': 'you dont have setup twofactor on your account', 'is_verified': False}, status=200)