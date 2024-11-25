from django.contrib.auth.models import AnonymousUser
from .send_request import send_request_with_token
from django.http import JsonResponse
from django.views import View
 
class GetAuthType(View):
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
            return JsonResponse({'message': str(e)}, status=400)

     
    def get_oauth_type(self, request):
        response = send_request_with_token(request_type='GET', request=request, url=f'http://oauth42:8000/api/oauth42/is_auth/?user_id={str(request.user.id)}')
        oauth42_response = response.json()
        if oauth42_response.get('status') == 'Success':
            return 'oauth42'
        response = send_request_with_token(request_type='GET', request=request, url=f'http://oauthgoogle:8000/api/oauthgoogle/is_auth/?user_id={str(request.user.id)}')
        oauthgoogle_response = response.json()
        if oauthgoogle_response.get('status') == 'Success':
            return 'oauthgoogle'
        response = send_request_with_token(request_type='GET', request=request, url=f'http://oauthgithub:8000/api/oauthgithub/is_auth/?user_id={str(request.user.id)}')
        oauth42_response = response.json()
        if oauth42_response.get('status') == 'Success':
            return 'oauthgithub'
        return None
