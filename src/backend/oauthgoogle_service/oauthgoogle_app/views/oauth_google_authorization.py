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

class oauthGoogleAuthorizationView(View):
    def __init__(self):
        super().__init__
    
    def get(self, request):
        if request.COOKIES.get('jwt'):
            return JsonResponse({'message': 'You are already logged in', 'url': '/home', 'status': 'Error'}, status=400)
        url = self.authorization() 
        response = JsonResponse({'url': url})
        
        # Set the state parameter as an HttpOnly cookie
        state = self.state
        response.set_cookie(
            'oauth2_state', 
            state,
            httponly=True,
            secure=True,
            samesite='None'
        )
        
        return response
    
    def authorization(self):
        client_id = env("API_UID_GOOGLE")
        authorization_url = "https://accounts.google.com/o/oauth2/v2/auth"
        client = WebApplicationClient(client_id)
        
        # Generate a secure random state parameter
        self.state = "oauthgoogle-" + secrets.token_urlsafe(16)
        
        # Prepare the authorization URL with the state parameter
        url = client.prepare_request_uri(
            authorization_url,
            redirect_uri="https://localhost:3000/oauth-redirect", 
            scope=['https://www.googleapis.com/auth/userinfo.profile',
                   'https://www.googleapis.com/auth/userinfo.email'],
            state=self.state,
            access_type="offline",
            include_granted_scopes="true"
        )

        return url


