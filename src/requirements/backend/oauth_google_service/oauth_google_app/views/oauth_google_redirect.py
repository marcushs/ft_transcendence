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
        state = request.GET.get('state')
        code = request.GET.get('code')
        
        cookie_state = request.COOKIES.get('oauth2_state')

        if state != cookie_state:
            return JsonResponse({'message': 'Invalid state parameter', 
                                 'status': 'Error'}, 
                                 status=400)
        # print('token_data-->')
        # token_data = self.exchange_code_for_token(code)
        # refresh_token = token_data['refresh_token']
        # print(token_data['expires_in'])
        # print('token_data-->')  
        # return JsonResponse(token_data)
        
        # if token_data['expires_in'] < 6300:
        #     token_data = self.get_new_token(refresh_token)
        token_data = self.exchange_code_for_token(code)
        if 'error' in token_data:
            return JsonResponse({'message': token_data['error'],
                                 'status': 'Error'}, 
                                 status=400)
        access_token = token_data['access_token']
        # refresh_token = token_data['refresh_token']

        # Create a dictionary with the access token
        response_data = {'message': 'Successfully exchange access token',
                         'status': 'Success'} 
        
        response = JsonResponse(token_data, status=200)
        # response = JsonResponse(response_data, status=200)
        # response.set_cookie('google_access_token', 
        #                     access_token,
        #                     httponly=True,
        #                     secure=True,
        #                     samesite='None')
        # response.set_cookie('42_refresh_token', 
        #                     refresh_token,
        #                     httponly=True,
        #                     secure=True,
        #                     samesite='None')
        response.delete_cookie('oauth2_state')

        return response
    
    def exchange_code_for_token(self, code):
        client_id = env("API_UID_GOOGLE") 
        token_url = "https://accounts.google.com/o/oauth2/token"
        client = WebApplicationClient(client_id)

        token_args = {
            "code": code,
            "client_secret": env("API_SECRET_GOOGLE"),
            "client_id": env("API_UID_GOOGLE"),
            "redirect_uri": "https://localhost:3000/oauth-redirect",
            "grant_type": "authorization_code",
        }
        token_response = requests.post(token_url, data=token_args)
       
        return token_response.json()
    
    # def get_new_token(self, refresh_token):
    #     client_id = env("API_UID_42") 
    #     token_url = "https://api.intra.42.fr/oauth/token"
    #     client = WebApplicationClient(client_id)

    #     data = client.prepare_request_body(
    #         grant_type = 'refresh_token',
    #         refresh_token = refresh_token,
    #         client_id = client_id,
    #         client_secret = env("API_SECRET_42")
    #     )

    #     response = requests.post(token_url, data=data)
    #     return response.json()
