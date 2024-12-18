from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.conf import settings
import jwt
from asgiref.sync import sync_to_async

User = get_user_model()

async def get_user_from_jwt(token):
    try:
        payload = jwt.decode(token, settings.JWT_VERIFYING_KEY,  algorithms=[settings.JWT_ALGORITHM])
        user = await sync_to_async(User.objects.get)(id=payload['user_id'])
        return user
    except jwt.ExpiredSignatureError:
        return 'expired'
    except Exception:
        return None