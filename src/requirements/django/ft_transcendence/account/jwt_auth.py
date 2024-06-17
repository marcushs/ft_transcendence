from django.views.decorators.csrf import csrf_protect
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.conf import settings
from functools import wraps
from typing import Any
import datetime
import jwt


def createJwtToken(user):
    payload = {
        'user_id': user.id,
        'exp': datetime.datetime.now() + datetime.timedelta(seconds=settings.JWP_EXP_DELTA_SECONDS)
    }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token

def decodeJwtToken(token):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY,  algorithms=[settings.JWT_ALGORITHM])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
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
    
# test view for jwt token
# @check_jwt
@csrf_protect
def protectedView(request):
    if request.user is not None:
        # print('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        return JsonResponse({'message': 'protected view ok', 'user': request.user.username}, status=201)
    else:
        return JsonResponse({'error': 'User not found'}, status=404)