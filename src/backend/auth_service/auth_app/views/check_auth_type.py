from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from send_request import send_request_with_token
from django.http import JsonResponse
from django.views import View
from ..models import User
import json
import re
 
class AliasManager(View):
    def __init__(self):
        super().__init__
     

    def get(self, request):
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'unknownUser'}, status=400)
            oauth_type = self.get_oauth_type(request)
            if oauth_type is None:
                return JsonResponse({'oauth_log': False, 'oauth_type': None}, status=200)
            return JsonResponse({'oauth_log': True, 'oauth_type': str(oauth_type)}, status=200)
        except Exception as e:
            print(f'Error: {str(e)}')

     
    def get_oauth_type(self, request):
        response = send_request_with_token(request_type='GET', request=request, url='http://localhost:8000/api/oauth_42/is_auth/')
        oauth_42_response = response.json()
        if oauth_42_response.get('status') == 'Success':
            return 'oauth_42'
        response = send_request_with_token(request_type='GET', request=request, url='http://localhost:8000/api/oauth_google/is_auth/')
        oauth_google_response = response.json()
        if oauth_google_response.get('status') == 'Success':
            return 'oauth_google'
        response = send_request_with_token(request_type='GET', request=request, url='http://localhost:8000/api/oauth_github/is_auth/')
        oauth_42_response = response.json()
        if oauth_42_response.get('status') == 'Success':
            return 'oauth_github'
        return None
