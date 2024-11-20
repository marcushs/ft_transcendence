# --- SRC --- #
from django.views import View
from django.http import JsonResponse, HttpResponseRedirect
from ..models import User
from django.contrib.auth import get_user_model
from oauthlib.oauth2 import WebApplicationClient
import secrets
from django.conf import settings
from django.contrib.auth.models import AnonymousUser

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

class get42ImageView(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        try:
            user_id = request.GET.get('user_id')
            if User.objects.filter(id=str(user_id)).exists():
                user = User.objects.filter(id=str(user_id))
                pp_link = user.profile_image_link
                print(pp_link)
                return JsonResponse({'message': 'pp_link', 'status': 'Success'}, status=200)
            return JsonResponse({'message': 'User not found', 'status': 'Error'}, status=400)
        except Exception as e:
            print(f'Error: {str(e)}')
            return JsonResponse({"message": str(e)}, status=400)
            
        
