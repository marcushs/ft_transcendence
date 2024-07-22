from django.http import JsonResponse
from django.utils import timezone
from django.views import View
from django.contrib.auth.models import AnonymousUser

import requests
import json
import pyotp

def send_update_request(user, csrf_token):
    payload = {
        'user_id': user.id,
        'is_verified': user.is_verified,
        'two_factor_method': user.two_factor_method
    }
    response = send_post_request(url='http://user:8000/account/update_user/', payload=payload, csrf_token=csrf_token)
    if response.status_code != 200:
        return response
    response = send_post_request(url='http://auth:8000/auth/update_user/', payload=payload, csrf_token=csrf_token)
    if response.status_code != 200:
        return response
    return response

def send_post_request(url, payload, csrf_token):
    headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
        }
    cookies = {'csrftoken': csrf_token}
    response = requests.post(url=url, headers=headers, cookies=cookies ,data=json.dumps(payload))
    if response.status_code == 200:
        return JsonResponse({'message': 'success'}, status=200)
    else:
        response_data = json.loads(response.text)

        message = response_data.get('message')
        return JsonResponse({'message': message}, status=400)

def twofactor_verify_view(request, two_factor_code, two_factor_method):
    if two_factor_method == 'authenticator':
        if two_factor_code == '':
            return JsonResponse({'message': 'Please enter the 2fa code.'}, status=400)
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