# --- SRC --- #
from django.contrib.auth.password_validation import UserAttributeSimilarityValidator
from django.contrib.auth.password_validation import CommonPasswordValidator
from django.contrib.auth.password_validation import validate_password
from .send_request import send_request_without_token
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.views import View

# --- UTILS --- #
import json
import re #regular expression 

User = get_user_model()

class signup_view(View):
    def __init__(self):
        super().__init__
        self.regexUsernameCheck = r'^[a-zA-Z0-9_-]+$'
        self.regexEmailCheck = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        self.url_list = [
            'http://chat:8000/api/chat',
            'http://friends:8000/api/friends',
            'http://matchmaking:8000/api/matchmaking',
            'http://notifications:8000/api/notifications',
            'http://statistics:8000/api/statistics',
            'http://tournament:8000/api/tournament',
            'http://twofactor:8000/api/twofactor',
            'http://user:8000/api/user'
        ]
        self.sended_url_list = []

 
    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            response = self._check_data(request, data)
            if response is not None:
                return response
            user = User.objects.create_user(username=str(data['username']), email=str(data['email']), password=str(data['password']))
            response = self._send_request(user=user, data=data, csrf_token=request.headers.get('X-CSRFToken'))
            if not response:
                user.delete()
                return JsonResponse({'message': 'errorWhileSignup'}, status=502)
            return JsonResponse({'message': 'accountCreated', 'redirect_url': 'login'}, status=200)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)

    def _send_request(self, data, user, csrf_token):
        try:
            language = 'en'
            if data.get('language'):
                language = data['language']

            payload = {
                    'user_id': str(user.id),
                    'username': user.username,
                    'email': user.email,
                    'logged_in_with_oauth': user.logged_in_with_oauth,
                    'language': language
            }
            for url in self.url_list:
                send_request_without_token(request_type='POST', url=f'{url}/add_user/', payload=payload, csrf_token=csrf_token)
                self.sended_url_list.append(url)
            return True
        except Exception as e:
            print(f'Error: {str(e)}')
            self._callback_signup_update_error(csrf_token, user)
            return False


    def _callback_signup_update_error(self, csrf_token, user):
        try:
            for url in self.sended_url_list:
                send_request_without_token(request_type='DELETE', url=f'{url}/delete_user/', csrf_token=csrf_token, payload={'user_id': str(user.id)})
        except Exception as e:
            print(f'Error: {str(e)}')


    def _check_data(self, request, data):
        if not data['username']:
            return JsonResponse({'message': 'noUsernameProvided'}, status=400)
        elif not re.match(self.regexUsernameCheck, data['username']):
            return JsonResponse({'message': 'invalidCharInUsername'}, status=400)
        elif not data['email']:
            return JsonResponse({'message': 'noEmailProvided'}, status=400)
        elif User.objects.filter(email=str(data['email'])).exists():
            return JsonResponse({'message': 'accountHasAlreadyEmail'}, status=400)
        elif not re.match(self.regexEmailCheck, data['email']):
            return JsonResponse({'message': 'invalidEmail'}, status=400)
        elif not data['password']:
            return JsonResponse({'message': 'noPasswordProvided'}, status=400)
        username = data['username']
        if len(data['username']) > 12:
            return JsonResponse({'message': 'tooLongUsername'}, status=400)
        if User.objects.filter(username=username).exists():
            return JsonResponse({'message': 'usernameAlreadyExists'}, status=400)
        try:
            validate_password(data['password'])
        except ValidationError as error:
            return JsonResponse({'message': str(error.messages[0])}, status=400)
        if data['password'] != data['confirm_password']:
            return JsonResponse({'message': 'passwordDidNotMatch'}, status=400)
        return None
    
    
class numeric_validator:
    def validate(self, password, user=None):
        if not re.search(r'[0-9]', password):
            raise ValidationError(
                "passwordMustContainOneNumericChar",
                code='no_numeric_char',
            )

    def get_help_text(self):
        return "Your password must contain at least one numeric character."

class uppercase_validator:
    def validate(self, password, user=None):
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                "passwordMustContainOneUppercase",
                code='password_no_upper',
            )

    def get_help_text(self):
        return "Your password must contain at least one uppercase letter."

class lowercase_validator:
    def validate(self, password, user=None):
        if not re.search(r'[a-z]', password):
            raise ValidationError(
                "passwordMustContainOneLetter",
                code='password_no_lower',
            )

    def get_help_text(self):
        return "Your password must contain at least one lowercase letter."


class password_len_validator:
    def validate(self, password, user=None):
            if len(password) < 8:
                raise ValidationError(
                    "tooShortPassword",
                    code='password_no_lower',
                )

    def get_help_text(self):
        return ""


class CustomCommonPasswordValidator(CommonPasswordValidator):
    def validate(self, password, user=None):
        try:
            super().validate(password, user)
        except ValidationError:
            raise ValidationError(
                "tooCommonPassword",
                code='password_too_common'
            )


class CustomUserAttributeSimilarityValidator(UserAttributeSimilarityValidator):
    def validate(self, password, user=None):
        try:
            super().validate(password, user)
        except ValidationError:
            raise ValidationError(
                "tooCloseToUserInfosPassword",
                code='password_too_common'
            )