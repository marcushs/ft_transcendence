from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.conf import settings
import datetime
from asgiref.sync import sync_to_async
import jwt

User = get_user_model()

def create_jwt_token(user, type: str) -> None:
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

def decode_jwt_token(token):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY,  algorithms=[settings.JWT_ALGORITHM])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def Refresh_jwt_token(refresh_token, type: str):
    user_id = decode_jwt_token(refresh_token)
    if user_id:
        return create_jwt_token(await get_user_from_jwt(refresh_token), type)
    return None

async def get_user_from_jwt(token):
    user_id = decode_jwt_token(token)
    if user_id:
        try:
            return await sync_to_async(User.objects.get)(id=user_id)
        except ObjectDoesNotExist:
            return None
    return None
