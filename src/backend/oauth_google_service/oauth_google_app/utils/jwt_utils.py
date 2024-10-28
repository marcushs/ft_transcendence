from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.conf import settings
from django.views import View
import datetime
import jwt

User = get_user_model()

# ---> generate a JWT token for a specific type (access or refresh) for user in args <---

def create_jwt_token(user, type: str) -> None:
    if type not in ['access', 'refresh']:
        raise TypeError("Type must be either 'access' or 'refresh'")
    if type == 'access':
        payload = {
            'user_id': str(user.id),
            'exp': datetime.datetime.now() + datetime.timedelta(seconds=settings.ACCESS_TOKEN_LIFETIME)
        }
    else:
        payload = {
            'user_id': str(user.id),
            'exp': datetime.datetime.now() + datetime.timedelta(seconds=settings.REFRESH_TOKEN_LIFETIME)
        }
    token = jwt.encode(payload, settings.JWT_SIGNING_KEY, algorithm=settings.JWT_ALGORITHM)
    return token
 
# ---> refresh specific type (access or refresh) JWT token with active refresh token in args <---

def Refresh_jwt_token(refresh_token, type: str):
    try:
        jwt.decode(refresh_token, settings.JWT_VERIFYING_KEY,  algorithms=[settings.JWT_ALGORITHM])
        token = create_jwt_token(get_user_from_jwt(refresh_token), type)
        return token
    except Exception:
        return None

# ---> returns the user object of the match in the database with an active token <---

def get_user_from_jwt(token):
    try:
        payload = jwt.decode(token, settings.JWT_VERIFYING_KEY,  algorithms=[settings.JWT_ALGORITHM])
        user = User.objects.get(id=payload['user_id'])
        return user
    except jwt.ExpiredSignatureError:
        # call auth jwt endpoint for refresh attempt here
        return None
    except Exception:
        return None

# ---> endpoint to call the jwt middleware that automates token management <---

class UpdateJwtToken(View):
    def __init__(self):
        super().__init__


    def get(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'No token provided'}, status=401)
        return JsonResponse({'message': 'tokens updated'}, status=200)
