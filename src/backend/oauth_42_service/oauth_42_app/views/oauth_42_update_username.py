# --- SRC --- #
from django.views import View
from django.http import JsonResponse
from ..models import User
from django.contrib.auth import get_user_model
from django.conf import settings

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

class oauth42UpdateUsernameView(View): 
    def __init__(self):
        super().__init__
        
    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))

        new_username = data['newUsername']
        id = request.COOKIES.get('id')
        self.csrf_token = request.headers.get('X-CSRFToken')
        response = self.check_new_username_taken(new_username)
        if response.status_code == 200:
            try:
                user = User.objects.get(id=id)
                user.username = new_username
                user.save()
                response = JsonResponse({"message": "Set username succesfully", "status": "Success"}, status=200)
                response.delete_cookie("id")
                self.init_payload(user)
                self.send_create_user_request_to_endpoints()
                return login(user=user, request=request, payload=self.payload, csrf_token=self.csrf_token)
            except User.DoesNotExist:
                return JsonResponse({"message": "User not found", "url":"/login", "status": "Error"}, status=404)
        return JsonResponse({"message": "Username already taken! Try another one.", "status": "Error", 'url': '/oauth-username?oauth_provider=oauth_42'}, status=400)
         
    def check_new_username_taken(self, username):
        url = 'http://user:8000/api/user/check_username/'
        response = requests.get(url=url, params={"username": username})
        if response.status_code == 400:
            return response
    
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
        return response

    def init_payload(self, user):
        self.payload = {
            'username': user.username,
            'user_id': str(user.id),
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'logged_in_with_oauth': True,
            'profile_image_link': user.profile_image_link,
        }
