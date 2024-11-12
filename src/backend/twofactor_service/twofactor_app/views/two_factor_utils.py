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
    
    try:
        response = send_request(request_type='POST', request=request, url='http://user:8000/api/user/update_user/', payload=payload)
        response = send_request(request_type='POST', request=request, url='http://auth:8000/api/auth/update_user/', payload=payload)
        return response
    except Exception:
        pass 
 
def send_request(request_type, request, url, payload=None):
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
        try:
            if request_type == 'GET':
                response = requests.get(url=url, headers=headers, cookies=cookies)
            else:
                response = requests.post(url=url, headers=headers, cookies=cookies ,data=json.dumps(payload))
            if response.status_code == 200:
                return response
            else:
                response.raise_for_status()
        except Exception as e:
            raise Exception(f"An error occurred: {e}")

def twofactor_verify_view(request, two_factor_code, two_factor_method):
    if two_factor_method == 'authenticator':
        if two_factor_code == '':
            return JsonResponse({'message': 'emptyCode'}, status=400) 
        totp = pyotp.TOTP(request.user.authenticator_secret)
        if not totp.verify(two_factor_code):
            return JsonResponse({'message': 'invalidCode'}, status=400)
    elif two_factor_method == 'email':
        if request.user.two_factor_code != two_factor_code:
            return JsonResponse({'message': 'invalidCode'}, status=400)
        if request.user.two_factor_code_expiry < timezone.now():
            return JsonResponse({'message': 'ExpiredCode'}, status=400)
    else:
        return JsonResponse({'message': 'invalidMethod'}, status=400)
    return JsonResponse({'message': 'twoFactorSuccess'}, status=200)

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
