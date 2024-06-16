import jwt
import datetime
from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect

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

# test view for jwt token
@csrf_protect
def protectedView(request):
    token = request.COOKIES.get('jwt')
    if token:
        user = getUserFromJwtToken(token)
        if user:
            return JsonResponse({'message': 'protected view ok', 'user': user.username}, status=201)
        else:
            return JsonResponse({'error': 'Invalid jwt token'}, status=401)
    return JsonResponse({'error': 'Authorization token not provided'}, status=401)