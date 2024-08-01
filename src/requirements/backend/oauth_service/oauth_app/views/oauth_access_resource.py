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

User = get_user_model()

env = environ.Env()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

class oauthAccessResourceView(View): 
    def __init__(self):
        super().__init__
    
    def get(self, request):
        token = request.COOKIES.get('access_token') 
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
            return JsonResponse(response_data, safe=False)
        except ValueError:
            return JsonResponse({'message': 'Invalid JSON response',
                                 'status': 'Error'}, 
                                 status=500)
