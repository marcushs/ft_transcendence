from django.conf import settings
from django.http import JsonResponse
from .jwt_utils import decode_jwt_token

class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
                user_id = decode_jwt_token(token)
                if user_id:
                    request.user_id = user_id
                else:
                    return JsonResponse({'error': 'Invalid token'}, status=401)
            except IndexError:
                return JsonResponse({'error': 'Token format invalid'}, status=401)
        else:
            request.user_id = None
        response = self.get_response(request)
        return response
