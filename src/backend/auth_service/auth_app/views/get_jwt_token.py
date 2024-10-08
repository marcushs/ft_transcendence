from django.http import JsonResponse
from django.views import View
from django.contrib.auth import get_user_model
import json

User = get_user_model()

class get_jwt_token_view(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        cookies = request.META.get("HTTP_COOKIE", None)

        cookies_list = cookies.split('; ')

        jwt_token = None
        for cookie in cookies_list:
            if cookie.startswith('jwt='):
                jwt_token = cookie.split('=', 1)[1]
                break
        response = JsonResponse({'message': f'{jwt_token}'}, status=200)
        return response