# --- SRC --- #
from django.views import View
from django.http import JsonResponse
from ..models import User
from django.contrib.auth import get_user_model
import uuid
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

# --- UTILS --- #
import json
import environ
import os
import requests
from ..utils.send_post_request import send_post_request
from ..utils.login_utils import login

User = get_user_model()

env = environ.Env()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

class oauthGithubAccessResourceView(View): 
    def __init__(self):
        super().__init__
    
    def get(self, request):
        token = request.COOKIES.get('github_access_token') 
        resource_url = 'https://api.github.com/user'

        headers = {
            'Authorization': f'Bearer {token}'  
        }

        response = requests.get(resource_url, headers=headers)
        print(response.text)
        # Check if the response contains JSON data and handle errors
        try:
            response_data = response.json()
            if 'status' in response_data and response_data['status'] == '401':
                return JsonResponse({'message': response_data['message'],
                                     'status': 'Error'}, 
                                     status=401)
            return self.create_or_login_user(request, response_data, token) 
        except ValueError:
            return JsonResponse({'message': 'Invalid JSON response',
                                 'status': 'Error'}, 
                                 status=500)
        
    def create_or_login_user(self, request, data, token): 
        self.csrf_token = request.headers.get('X-CSRFToken')
        self.username = data['login']
        self.profile_image_link = data['avatar_url']
        self.split_fullname(data['name'])
        response = self.get_user_email(token)
        if response.status_code == 401:
            return response
        self.init_payload() 

        try:
            user = User.objects.get(email=self.email)
            self.payload['user_id'] = str(user.id)
            return login(user=user, request=request, payload=self.payload, csrf_token=self.csrf_token)
        except User.DoesNotExist:
            user = User.objects.create_user(id=uuid.uuid4(),
                                            username=self.username,
                                            email=self.email,
                                            first_name=self.first_name,
                                            last_name=self.last_name,
                                            profile_image_link=self.profile_image_link)
            self.id = str(user.id)
            self.payload['user_id'] = self.id 
            response = self.send_create_user_request_to_endpoints()
            if response is not None and response.status_code == 400:
                response_data = json.loads(response.content)
                if response_data['message'] == "Email address already registered! Try logging in.":
                    user.delete()
                    response_data['url'] = '/login'
                    response = JsonResponse(response_data, status=400)
                elif response_data['message'] == "Username already taken! Try another one.":
                    response_data['url'] = '/oauth-username?oauth_provider=oauth_42'
                    response = JsonResponse(response_data, status=400)
                    response.set_cookie('id', self.id, httponly=True)
                return response
            return login(user=user, request=request, payload=self.payload, csrf_token=self.csrf_token) 
    
    def send_create_user_request_to_endpoints(self):
        urls = ['http://auth:8000/auth/add_oauth_user/', 'http://twofactor:8000/twofactor/add_user/', 'http://user:8000/user/add_user/'] 
        for url in urls: 
            response = send_post_request(url=url, payload=self.payload, csrf_token=self.csrf_token)
            if response.status_code == 400:
                return response
 
    def init_payload(self):
        self.payload = {
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'logged_in_with_oauth': True,
            'profile_image_link': self.profile_image_link,
        }

    def get_user_email(self, token):
        resource_url = 'https://api.github.com/user/emails'
        headers = {
            'Accept': 'application/json',
            'Authorization': f'Bearer {token}'
        }
        response = requests.get(resource_url, headers=headers)
        response_data = response.json()
        if 'status' in response_data and response_data['status'] == '401':
            return JsonResponse({'message': response_data['message'],
                                'status': 'Error'}, 
                                status=401)
        self.email = response_data[0]['email']
        return JsonResponse({'message': "Successfully fetched user email", "status": "Success"}, status=200)

    def split_fullname(self, fullname):
        names = fullname.split(' ') 
        self.first_name = names[0]
        self.last_name = names[-1]

        
