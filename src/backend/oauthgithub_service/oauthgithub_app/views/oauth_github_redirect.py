from django.http import JsonResponse
from django.views import View
from oauthlib.oauth2 import WebApplicationClient
# from oauthlib.oauth2 import RefreshTokenGrant
# from oauthlib.common import Request
import environ
import os
import requests

env = environ.Env()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

class oauthGithubRedirectView(View):
    def get(self, request):
        try:
            state = request.GET.get('state')
            code = request.GET.get('code')
            
            cookie_state = request.COOKIES.get('oauthgithub_state')

            if state != cookie_state:
                return JsonResponse({'message': 'Invalid state parameter', 
                                    'status': 'Error'}, 
                                    status=400)
            
            token_data = self.exchange_code_for_token(code)
            if 'error' in token_data:
                return JsonResponse({'message': token_data['error_description'],
                                    'status': 'Error'}, 
                                    status=400)
            access_token = token_data['access_token']

            response_data = {'message': 'Successfully exchange access token',
                            'status': 'Success'}
            
            response = JsonResponse(response_data, status=200)
            response.set_cookie('github_access_token', 
                                access_token,
                                httponly=True,
                                secure=True,
                                samesite='None')
            response.delete_cookie('oauthgithub_state')

            return response
        except Exception as e:
            print(f'Error: {str(e)}')
            return JsonResponse({"message": str(e)}, status=400)
    
    def exchange_code_for_token(self, code):
        client_id = env("API_UID_GITHUB") 
        token_url = "https://github.com/login/oauth/access_token"
        client = WebApplicationClient(client_id)
        headers = {
            'Accept': 'application/json',
        }

        data = client.prepare_request_body(
            code = code,
            redirect_uri = f'https://{env('SERVER_IP')}:3000/oauth-redirect',
            client_id = client_id,
            client_secret = env("API_SECRET_GITHUB")
        )

        response = requests.post(token_url, data=data, headers=headers)
        return response.json()
