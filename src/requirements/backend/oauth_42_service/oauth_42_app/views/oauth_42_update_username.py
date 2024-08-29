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
        try:
            user = User.objects.get(id=id)
            user.username = new_username
            user.save()
            response = JsonResponse({"message": "Set username succesfully", "url": "/home", "status": "Success"}, status=200)
            response.delete_cookie("id")
            return response
        except User.DoesNotExist:
            return JsonResponse({"message": "User not found", "url":"/login", "status": "Error"}, status=400)
