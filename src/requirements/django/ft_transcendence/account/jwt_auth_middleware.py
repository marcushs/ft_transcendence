from django.conf import settings
from django.http import JsonResponse
from .jwt_utils import decode_jwt_token
from django.contrib.auth.models import User
import jwt

class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = request.COOKIES.get('jwt')
        if token:
            try:
                payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
                user_id = payload.get('user_id')
                try:
                    request.user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    return JsonResponse({'error': 'User not found'}, status=401)
            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': 'Token expired'}, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': 'Invalid token'}, status=401)
        else:
            request.user = None

        response = self.get_response(request)
        return response
