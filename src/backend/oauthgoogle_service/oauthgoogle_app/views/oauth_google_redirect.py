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

class oauthGoogleRedirectView(View):
    def get(self, request):
        try:
            state = str(request.GET.get('state'))
            code = request.GET.get('code')
            
            cookie_state = request.COOKIES.get('oauthgoogle_state')

            if state != cookie_state:
                return JsonResponse({'message': 'Invalid state parameter', 
                                    'status': 'Error'}, 
                                    status=400)
            token_data = self.exchange_code_for_token(code)
            if 'error' in token_data:
                return JsonResponse({'message': token_data['error'],
                                    'status': 'Error'}, 
                                    status=400)
            access_token = token_data['access_token']

            # Create a dictionary with the access token
            response_data = {'message': 'Successfully exchange access token',
                            'status': 'Success'} 
            
            response = JsonResponse(response_data, status=200)
            response.set_cookie('google_access_token', 
                                access_token,
                                httponly=True,
                                secure=True,
                                samesite='None')
            response.delete_cookie('oauthgoogle_state')

            return response
        except Exception as e:
            print(f'Error: {str(e)}')
            return JsonResponse({"message": str(e)}, status=502)
    
    def exchange_code_for_token(self, code):
        client_id = env("API_UID_GOOGLE") 
        token_url = "https://accounts.google.com/o/oauth2/token"
        client = WebApplicationClient(client_id)

        token_args = {
            "code": code,
            "client_secret": env("API_SECRET_GOOGLE"),
            "client_id": env("API_UID_GOOGLE"),
            "redirect_uri": 'https://localhost:3000/oauth-redirect',
            "grant_type": "authorization_code",
        }
        token_response = requests.post(token_url, data=token_args)
       
        return token_response.json()
