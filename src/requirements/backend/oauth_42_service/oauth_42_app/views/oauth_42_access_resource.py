# --- SRC --- #
from django.views import View
from django.http import JsonResponse, HttpResponseRedirect
from ..models import User
from django.contrib.auth import get_user_model
from oauthlib.oauth2 import WebApplicationClient
import secrets
from django.conf import settings

# --- UTILS --- #
import json
import re #regular expression
import environ
import os
import requests
from ..utils.send_post_request import send_post_request

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
            self.payload['user_id'] = user.id
            return self.login()
        except User.DoesNotExist:
            user = User.objects.create_user(username=self.username,
                                            email=self.email,
                                            first_name=self.first_name,
                                            last_name=self.last_name,
                                            profile_image_link=self.profile_image_link)
            self.payload['user_id'] = user.id
            self.send_create_user_request_to_endpoints()
            return self.login()
    
    def send_create_user_request_to_endpoints(self):
        post_response = send_post_request(url='http://auth:8000/auth/add_oauth_user/', payload=self.payload, csrf_token=self.csrf_token)

        post_response = send_post_request(url='http://twofactor:8000/twofactor/add_user/', payload=self.payload, csrf_token=self.csrf_token)

        post_response = send_post_request(url='http://user:8000/user/add_user/', payload=self.payload, csrf_token=self.csrf_token)
        print(f'post response: {post_response}')
        return post_response

    def init_payload(self):
        self.payload = {
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'logged_in_with_42': True,
            'profile_image_link': self.profile_image_link,
        }

    def login(self):
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': self.csrf_token
        }
        cookies = {'csrftoken': self.csrf_token}
        response = requests.post(url='http://auth:8000/auth/login/', headers=headers, cookies=cookies ,data=json.dumps(self.payload))
        response_data = response.json()
        if response.status_code == 200:
            token = response.cookies.get('jwt')
            refresh_token = response.cookies.get('jwt_refresh')
            response = JsonResponse(response_data)
            response.set_cookie('jwt', token, httponly=True, max_age=settings.JWT_EXP_DELTA_SECONDS)
            response.set_cookie('jwt_refresh', refresh_token, httponly=True, max_age=settings.JWT_REFRESH_EXP_DELTA_SECONDS)
            return response
        else:
            return JsonResponse(response_data)
