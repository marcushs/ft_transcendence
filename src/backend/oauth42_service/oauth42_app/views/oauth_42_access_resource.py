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

class oauth42AccessResourceView(View): 
    def __init__(self):
        super().__init__
    
    def get(self, request):
        try:
            token = request.COOKIES.get('42_access_token')
            resource_url = 'https://api.intra.42.fr/v2/me'

            headers = { 
                'Authorization': f'Bearer {str(token)}'
            }

            response = requests.get(resource_url, headers=headers)

            try:
                response_data = response.json()
                if 'error' in response_data:
                    response = JsonResponse({'message': response_data['error'],
                                        'status': 'Error'},
                                        status=400)
                    response.delete_cookie('42_access_token')
                    return response
                return self.create_or_login_user(request, response_data)
            except ValueError:
                response = JsonResponse({'message': 'Invalid JSON response',
                                    'status': 'Error'},
                                    status=400)
                response.delete_cookie('42_access_token')
                return response
        except Exception as e:
            print(f'Error: {str(e)}')
            return JsonResponse({"message": str(e)}, status=400)
        
    def create_or_login_user(self, request, data):
        self.csrf_token = request.headers.get('X-CSRFToken')
        self.username = data['login']
        if len(self.username) > 12:
            self.username = data['login'][:12]
        self.email = data['email']
        self.first_name = data['first_name']
        self.last_name = data['last_name']
        self.profile_image_link = data['image']['link']
        self.init_payload()

        try:
            user = User.objects.get(email=self.email)
            response = self.check_new_username_taken(user.username)

            if response.status_code == 409:
                response_data = json.loads(response.content.decode('utf-8'))
                if 'user_id' in response_data and response_data['user_id'] != str(user.id):
                    response = JsonResponse({"message": "Username already taken! Try another one.", "status": "Error", "url": '/oauth-username?oauth_provider=oauth42'}, status=409)
                    response.set_cookie('id', str(user.id))
                    return response 
                     
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
                    print('why here?')
                    response_data['url'] = '/oauth-username?oauth_provider=oauth42'
                    response = JsonResponse(response_data, status=409)
                    response.set_cookie('id', self.id, httponly=True)
                response.delete_cookie('42_access_token')
                return response
            return login(user=user, request=request, payload=self.payload, csrf_token=self.csrf_token) 
    
    def send_create_user_request_to_endpoints(self): 
        urls = ['http://auth:8000/api/auth/add_oauth_user/', 
                'http://twofactor:8000/api/twofactor/add_user/', 
                'http://user:8000/api/user/add_user/', 
                'http://friends:8000/api/friends/add_user/', 
                'http://notifications:8000/api/notifications/add_user/',
                'http://matchmaking:8000/api/matchmaking/add_user/',
                'http://statistics:8000/api/statistics/add_user/',
                'http://chat:8000/api/chat/add_user/', 
                'http://tournament:8000/api/tournament/add_user/',] 
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

    def check_new_username_taken(self, username):
        url = 'http://user:8000/api/user/check_username/'
        try:
            response = requests.get(url=url, params={"username": username})
            if response.status_code == 409:
                return response
            response.raise_for_status()
            return response 
        except Exception as e: 
            print(f'Error: {str(e)}')
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)