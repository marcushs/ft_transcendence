import jwt
from datetime import datetime, timedelta
from django.conf import settings

def create_jwt_token(user, type: str) -> str:
    if not isinstance(type, str) or type not in ['access', 'refresh']:
        raise TypeError("Unrecognized type for jwt token")
    if type == 'access':
        payload = {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(seconds=settings.JWT_EXP_DELTA_SECONDS)
        }
    else:  # 'refresh'
        payload = {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(seconds=settings.JWT_REFRESH_EXP_DELTA_SECONDS)
        }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token

def decode_jwt_token(token):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload['user_id']
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
