# --- SRC --- #
from django.views import View
from django.http import JsonResponse
from ..models import User
from django.contrib.auth import get_user_model
from oauthlib.oauth2 import WebApplicationClient

# --- UTILS --- #
import json
import re #regular expression
import environ
import os
# import requests

User = get_user_model()

env = environ.Env()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

class oauthSignupView(View):
    def __init__(self):
        super().__init__
    
    def get(self, request):
        url = self.authorization()
        return JsonResponse({'url': url})
    
    def authorization(self):
        client_id = env("42_API_UID")
        authorization_url = "https://api.intra.42.fr/oauth/authorize"
        client = WebApplicationClient(client_id)
        
        url = client.prepare_request_uri(
            authorization_url,
            redirect_uri="http://localhost:3000/login",
            scope=['public'],
            state="randomstate"
        )
        return url

