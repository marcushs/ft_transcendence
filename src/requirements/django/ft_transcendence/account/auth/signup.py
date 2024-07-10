# --- SRC --- #
from django.views import View
from django.http import JsonResponse
from ..models import User
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model

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

class signupView(View):
    def __init__(self):
        super().__init__
        self.regexUsernameCheck = r'^[a-zA-Z0-9_-]+$'
        self.regexEmailCheck = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    def get(self, request):
        url = "https://api.intra.42.fr/oauth/token"
        data = {
            "grant_type": "client_credentials",
            "client_id": env("42_API_UID"),
            "client_secret": env("42_API_SECRET")
        }
        response = requests.post(url, data=data)
        return JsonResponse({'message': 'get response', 'responst': response.json()})


    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        response = self._check_data(request, data)
        if response is not None:
            return response
        User.objects.create_user(username=data['username'], email=data['email'], password=data['password'])
        return JsonResponse({'message': 'User created successfully', 'redirect_url': 'login'}, status=201)
    
    
    def _check_data(self, request, data):
        if not data['username']:
            return JsonResponse({'error': 'No username provided'}, status=401)
        elif not re.match(self.regexUsernameCheck, data['username']):
            return JsonResponse({'error': 'Invalid characters in username'}, status=401)
        elif not data['email']:
            return JsonResponse({'error': 'No email provided'}, status=401)
        elif User.objects.filter(email=data['email']).exists():
            return JsonResponse({'error': 'This email have already an account'}, status=401)
        elif not re.match(self.regexEmailCheck, data['email']):
            return JsonResponse({'error': 'Invalid email'}, status=401)
        elif not data['password']:
            return JsonResponse({'error': 'No password provided'}, status=401)
        try:
            validate_password(data['password'])
        except ValidationError as error:
            return JsonResponse({'error': str(error.messages[0])}, status=401)
        if data['password'] != data['confirm_password']:
            return JsonResponse({'error': 'Password did not match'}, status=401)
        username = data['username']
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=401)
        return None
    
    
class NumericValidator:
    def validate(self, password, user=None):
        if not re.search(r'[0-9]', password):
            raise ValidationError(
                _("This password must contain at least one numeric character."),
                code='no_numeric_char',
            )

    def get_help_text(self):
        return _("Your password must contain at least one numeric character.")

class UppercaseValidator:
    def validate(self, password, user=None):
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                _("This password must contain at least one uppercase letter."),
                code='password_no_upper',
            )

    def get_help_text(self):
        return _("Your password must contain at least one uppercase letter.")

class LowercaseValidator:
    def validate(self, password, user=None):
        if not re.search(r'[a-z]', password):
            raise ValidationError(
                _("This password must contain at least one lowercase letter."),
                code='password_no_lower',
            )

    def get_help_text(self):
        return _("Your password must contain at least one lowercase letter.")
