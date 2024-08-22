from django.http import JsonResponse
from django.utils import timezone
from django.views import View
from django.contrib.auth.models import AnonymousUser

import requests
import json
import pyotp

def send_update_request(request):
    payload = {
        'is_verified': request.user.is_verified,
        'two_factor_method': request.user.two_factor_method
    }
    
    response = send_post_request(request=request, url='http://user:8000/user/update_user/', payload=payload)
    if response.status_code != 200:
        return response
    response = send_post_request(request=request, url='http://auth:8000/auth/update_user/', payload=payload)
    if response.status_code != 200:
        return response
    return response
 
def send_post_request(request, url, payload):
    headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': request.COOKIES.get('csrftoken')
        }
    cookies = {
        'csrftoken': request.COOKIES.get('csrftoken'),
        'jwt': request.COOKIES.get('jwt'),
        'jwt_refresh': request.COOKIES.get('jwt_refresh'),
        }
    response = requests.post(url=url, headers=headers, cookies=cookies ,data=json.dumps(payload))
    if response.status_code == 200:
        return JsonResponse({'message': 'success'}, status=200)
    else:
        # response_data = json.loads(response)
        # message = response_data.get('message')
        return JsonResponse({'message': 'fail'}, status=400)

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
    return JsonResponse({'message': 'Two factor authentication successfully enabled'}, status=200)

class twofactor_get_status_view(View):
    def __init__(self):
        super().__init__
    
    
    def get(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'You are not logged in'}, status=401)
        if request.user.is_verified == True:
            return JsonResponse({'message': 'You have setup twofactor on your account', 'is_verified': True, 'method': request.user.two_factor_method}, status=200)
        else:
            return JsonResponse({'message': 'You dont have setup twofactor on your account', 'is_verified': False}, status=200)