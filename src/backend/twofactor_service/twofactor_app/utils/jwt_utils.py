from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.conf import settings
import jwt

User = get_user_model()


def get_user_from_jwt(token):
    try:
        payload = jwt.decode(token, settings.JWT_VERIFYING_KEY,  algorithms=[settings.JWT_ALGORITHM])
        user = User.objects.get(id=payload['user_id'])
        return user
    except jwt.ExpiredSignatureError:
        return 'expired'
    except Exception:
        return None
