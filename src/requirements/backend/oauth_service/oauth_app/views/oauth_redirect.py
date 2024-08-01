from django.http import JsonResponse
from django.views import View
from oauthlib.oauth2 import WebApplicationClient
import environ
import os
import requests

env = environ.Env()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

class oauthRedirectView(View):
    def get(self, request):
        state = request.GET.get('state')
        code = request.GET.get('code')
        
        cookie_state = request.COOKIES.get('oauth2_state')

        if state != cookie_state:
            return JsonResponse({'message': 'Invalid state parameter', 
                                 'status': 'Error'}, 
                                 status=400)
        
        token_data = self.exchange_code_for_token(code)

        if 'error' in token_data:
            return JsonResponse({'message': token_data['error_description'],
                                 'status': token_data['error']}, 
                                 status=400)

        access_token = token_data['access_token']

        # Create a dictionary with the access token
        response_data = {'message': 'Successfully exchange access token',
                         'status': 'Success'}
        
        response = JsonResponse(response_data, status=200)
        response.set_cookie('access_token', 
                            access_token,
                            httponly=True,
                            secure=True,
                            samesite='None')
        response.delete_cookie('oauth2_state')

        return response
    
    def exchange_code_for_token(self, code):
        client_id = env("API_UID_42") 
        token_url = "https://api.intra.42.fr/oauth/token"
        client = WebApplicationClient(client_id)

        data = client.prepare_request_body(
            code = code,
            redirect_uri = "https://localhost:3000/oauth-redirect",
            client_id = client_id,
            client_secret = env("API_SECRET_42")
        )

        response = requests.post(token_url, data=data)
        return response.json()
    
    def access_resources(self, token):
        headers = {
            'Authorization': f'Bearer {token}'
        }

        print(f'from access_resources: {token}')
        response_data = requests.get('https://api.intra.42.fr/v2/me', headers=headers)

        # Check if the response contains JSON data and handle errors
        try:
            print('here???')
            
            response = JsonResponse(response_data, safe=False)
        except ValueError:
            return JsonResponse({'error': 'Invalid JSON response'}, status=500)
        
        # Return the JSON response
        return response
