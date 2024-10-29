# --- SRC --- #
from django.views import View
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from .send_request import send_request_without_token

# --- UTILS --- #
import json
import re #regular expression

User = get_user_model()

class signup_view(View):
    def __init__(self):
        super().__init__
        self.regexUsernameCheck = r'^[a-zA-Z0-9_-]+$'
        self.regexEmailCheck = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
 
    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        response = self._check_data(request, data)
        if response is not None:
            return response
        user = User.objects.create_user(username=data['username'], email=data['email'], password=data['password'])
        response = self._send_request(user=user, csrf_token=request.headers.get('X-CSRFToken'))
        if not response:
            user.delete()
            return JsonResponse({'message': 'an error occured while creating user in different service'}, status=400)
        return JsonResponse({'message': 'User created successfully', 'redirect_url': 'login'}, status=200)

    def _send_request(self, user, csrf_token):
        payload = {
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
        }
        try:
            send_request_without_token(request_type='POST', url='http://user:8000/user/add_user/', payload=payload, csrf_token=csrf_token)
            send_request_without_token(request_type='POST', url='http://twofactor:8000/twofactor/add_user/', payload=payload, csrf_token=csrf_token)
            send_request_without_token(request_type='POST', url='http://friends:8000/friends/add_user/', payload=payload, csrf_token=csrf_token)
            send_request_without_token(request_type='POST', url='http://notifications:8000/notifications/add_user/', payload=payload, csrf_token=csrf_token)
            send_request_without_token(request_type='POST', url='http://matchmaking:8000/matchmaking/add_user/', payload=payload, csrf_token=csrf_token)
            send_request_without_token(request_type='POST', url='http://statistics:8000/statistics/add_user/', payload=payload, csrf_token=csrf_token)
            return True
        except Exception as e:
            return False
 
    def _check_data(self, request, data):
        if not data['username']:
            return JsonResponse({'message': 'No username provided'}, status=401)
        elif not re.match(self.regexUsernameCheck, data['username']):
            return JsonResponse({'message': 'Invalid characters in username'}, status=401)
        elif not data['email']:
            return JsonResponse({'message': 'No email provided'}, status=401)
        elif User.objects.filter(email=data['email']).exists():
            return JsonResponse({'message': 'This email have already an account'}, status=401)
        elif not re.match(self.regexEmailCheck, data['email']):
            return JsonResponse({'message': 'Invalid email'}, status=401)
        elif not data['password']:
            return JsonResponse({'message': 'No password provided'}, status=401)
        username = data['username']
        if User.objects.filter(username=username).exists():
            return JsonResponse({'message': 'Username already exists'}, status=401)
        try:
            validate_password(data['password'])
        except ValidationError as error:
            return JsonResponse({'message': str(error.messages[0])}, status=401)
        if data['password'] != data['confirm_password']:
            return JsonResponse({'message': 'Password did not match'}, status=401)  
        return None
    
    
class numeric_validator:
    def validate(self, password, user=None):
        if not re.search(r'[0-9]', password):
            raise ValidationError(
                _("This password must contain at least one numeric character."),
                code='no_numeric_char',
            )

    def get_help_text(self):
        return _("Your password must contain at least one numeric character.")

class uppercase_validator:
    def validate(self, password, user=None):
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                _("This password must contain at least one uppercase letter."),
                code='password_no_upper',
            )

    def get_help_text(self):
        return _("Your password must contain at least one uppercase letter.")

class lowercase_validator:
    def validate(self, password, user=None):
        if not re.search(r'[a-z]', password):
            raise ValidationError(
                _("This password must contain at least one lowercase letter."),
                code='password_no_lower',
            )

    def get_help_text(self):
        return _("Your password must contain at least one lowercase letter.")
