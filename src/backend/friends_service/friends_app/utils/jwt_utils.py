from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.conf import settings
import jwt

User = get_user_model()

# ---> returns the user object of the match in the database with an active token <---

def get_user_from_jwt(token):
    try:
        payload = jwt.decode(token, settings.JWT_VERIFYING_KEY,  algorithms=[settings.JWT_ALGORITHM])
        user = User.objects.get(id=payload['user_id'])
        return user
    except jwt.ExpiredSignatureError:
        return 'expired'
    except Exception:
        return None

# ---> endpoint to call the jwt middleware that automates token management <---

# class UpdateJwtToken(View):
#     def __init__(self):
#         super().__init__


#     def get(self, request):
#         if isinstance(request.user, AnonymousUser):
#             return JsonResponse({'message': 'No token provided'}, status=401)
#         return JsonResponse({'message': 'tokens updated'}, status=200)