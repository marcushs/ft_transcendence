from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.conf import settings
import datetime
import jwt

User = get_user_model()

def create_jwt_token(user, type: str) -> None:
    if not isinstance(type, str) or (type != 'access' and type != 'refresh'):
        raise TypeError("Inrecognized type for jwt token")
    if type == 'access':
        payload = {
            'user_uuid': user.uuid,
            'exp': datetime.datetime.now() + datetime.timedelta(seconds=settings.JWT_EXP_DELTA_SECONDS)
        }
        token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return token
    else:
        payload = {
            'user_uuid': user.uuid,
            'exp': datetime.datetime.now() + datetime.timedelta(seconds=settings.JWT_REFRESH_EXP_DELTA_SECONDS)
        }
        refresh_token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return refresh_token    

def decode_jwt_token(token):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY,  algorithms=[settings.JWT_ALGORITHM])
        return payload['user_uuid']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def Refresh_jwt_token(refresh_token, type: str):
    user_uuid = decode_jwt_token(refresh_token)
    if user_uuid:
        return create_jwt_token(get_user_from_jwt(refresh_token), type)    
    return None

def get_user_from_jwt(token):
    user_uuid = decode_jwt_token(token)
    if user_uuid:
        try:
            return User.objects.get(uuid=user_uuid)
        except ObjectDoesNotExist:
            return None
    return None
