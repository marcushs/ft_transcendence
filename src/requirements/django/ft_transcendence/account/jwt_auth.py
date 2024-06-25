from django.views.decorators.csrf import csrf_protect
from django.core.exceptions import ObjectDoesNotExist
from django.middleware.csrf import get_token
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.conf import settings
from functools import wraps
from typing import Any
import datetime
import jwt

def generate_csrf_token(request):
    csrf_token = get_token(request)  # generate new token CSRF
    return csrf_token

def createJwtToken(user, type: str) -> None:
    if not isinstance(type, str) or (type != 'access' and type != 'refresh'):
        raise TypeError("Inrecognized type for jwt token")
    if type == 'access':
        payload = {
            'user_id': user.id,
            'exp': datetime.datetime.now() + datetime.timedelta(seconds=settings.JWT_EXP_DELTA_SECONDS)
        }
        token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return token
    else:
        payload = {
            'user_id': user.id,
            'exp': datetime.datetime.now() + datetime.timedelta(seconds=settings.JWT_REFRESH_EXP_DELTA_SECONDS)
        }
        refresh_token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return refresh_token

def decodeJwtToken(token):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY,  algorithms=[settings.JWT_ALGORITHM])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def RefreshJwtToken(refresh_token, type: str):
    user_id = decodeJwtToken(refresh_token)
    if user_id:
        return createJwtToken(getUserFromJwtToken(refresh_token), type)    
    return None

def getUserFromJwtToken(token):
    user_id = decodeJwtToken(token)
    if user_id:
        try:
            return User.objects.get(id=user_id)
        except ObjectDoesNotExist:
            return None
    return None

# View decorator for jwt check token
def check_jwt(view_func):
    @wraps(view_func) # save the original function in the new wrapped function as "view_func"
    def _wrapped_view(request, *args, **kwargs): # manage a variable number of positional arguments (*args) and named arguments (or keywords) (**kwargs)
        token = request.COOKIES.get('jwt')
        if token:
            user = getUserFromJwtToken(token)
            if user:
                request.jwt_user = user # Associates user with the request
                return view_func(request, *args, **kwargs) #  Call the original view with the modified query
            else:
                return JsonResponse({'error': 'Invalid jwt token'}, status=401)
        return JsonResponse({'error': 'Authorization token not provided'}, status=401)
    return _wrapped_view
