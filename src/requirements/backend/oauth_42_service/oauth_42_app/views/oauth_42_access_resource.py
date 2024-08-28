# --- SRC --- #
from django.views import View
from django.http import JsonResponse, HttpResponseRedirect
from ..models import User
from django.contrib.auth import get_user_model
from oauthlib.oauth2 import WebApplicationClient
import uuid
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

# --- UTILS --- #
import json
import re #regular expression
import environ
import os
import requests
from ..utils.send_post_request import send_post_request
from ..utils.jwt_utils import create_jwt_token

User = get_user_model()

env = environ.Env()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

class oauth42AccessResourceView(View): 
    def __init__(self):
        super().__init__
    
    def get(self, request):
        token = request.COOKIES.get('42_access_token') 
        resource_url = 'https://api.intra.42.fr/v2/me'

        headers = {
            'Authorization': f'Bearer {token}'
        }

        response = requests.get(resource_url, headers=headers)

        # Check if the response contains JSON data and handle errors
        try:
            response_data = response.json()
            if 'error' in response_data:
                return JsonResponse({'message': response_data['error'],
                                     'status': 'Error'}, 
                                     status=400)
            return self.create_or_login_user(request, response_data)
        except ValueError:
            return JsonResponse({'message': 'Invalid JSON response',
                                 'status': 'Error'}, 
                                 status=500)
        
    def create_or_login_user(self, request, data):
        self.csrf_token = request.headers.get('X-CSRFToken')
        self.username = data['login']
        self.email = data['email']
        self.first_name = data['first_name']
        self.last_name = data['last_name']
        self.profile_image_link = data['image']['link']
        self.init_payload()

        try:
            user = User.objects.get(username=self.username)
            self.payload['user_id'] = str(user.id)
            return self.login(user=user, request=request)
        except User.DoesNotExist:
            user = User.objects.create_user(id=uuid.uuid4(),
                                            username=self.username,
                                            email=self.email,
                                            first_name=self.first_name,
                                            last_name=self.last_name,
                                            profile_image_link=self.profile_image_link)
            response = self.send_create_user_request_to_endpoints()
            self.payload['user_id'] = str(user.id)
            if response is not None and response.status_code == 400:
                data = json.loads(response.content)
                if data['message'] == "Username already taken! Try another one.":
                    data['url'] = '/oauth-username'
                elif data['message'] == "Email address already registered! Try logging in.":
                    data['url'] = '/login'
                response = JsonResponse(data, status=400)
                return response
            return self.login(user=user, request=request) 
    
    def send_create_user_request_to_endpoints(self):
        urls = ['http://auth:8000/auth/add_oauth_user/', 'http://twofactor:8000/twofactor/add_user/', 'http://user:8000/user/add_user/']
        for url in urls:
            response = send_post_request(url=url, payload=self.payload, csrf_token=self.csrf_token)
            if response.status_code == 400:
                print("return")
                return response  
 
    def init_payload(self):
        self.payload = {
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'logged_in_with_42': True,
            'profile_image_link': self.profile_image_link,
        }

    def login(self, user, request):
        if user.two_factor_method != '':
            return self._send_twofactor_request(user=user)
        if request.COOKIES.get('jwt'):
            return JsonResponse({'message': 'You are already logged in'}, status=400)
        try:
            if user.is_verified is True:
                return JsonResponse({'message': '2FA activated on this account, need to verify before log', 'is_verified': user.is_verified}, status=200)
            response = self._create_user_session(user=user)
        except User.DoesNotExist:
            response = JsonResponse({'message': 'Invalid username, please try again'}, status=400) 
        return response
    
    def _create_user_session(self, user):
        token = create_jwt_token(user, 'access')
        refresh_token = create_jwt_token(user, 'refresh')
        response = JsonResponse({'message': 'Login successfully'}, status=200)
        response.set_cookie('jwt', token, httponly=True, max_age=settings.JWT_EXP_DELTA_SECONDS)
        response.set_cookie('jwt_refresh', refresh_token, httponly=True, max_age=settings.JWT_REFRESH_EXP_DELTA_SECONDS)
        return response
    
    def _send_twofactor_request(self, user):
        try:
            response = send_post_request(url='http://twofactor:8000/twofactor/twofactor_login/', payload=self.payload, csrf_token=self.csrf_token)
            if response.status_code != 200:
                return response
            return self._create_user_session(user=user)
        except ObjectDoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
 