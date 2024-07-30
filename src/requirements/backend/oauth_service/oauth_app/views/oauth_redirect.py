from django.http import JsonResponse
from django.views import View

class oauthRedirectView(View):
    def get(self, request):
        state = request.GET.get('state')
        code = request.GET.get('code')
        
        cookie_state = request.COOKIES.get('oauth2_state')
        
        print(state)
        print(code)
        print(cookie_state)

        if state != cookie_state:
            return JsonResponse({'error': 'Invalid state parameter'}, status=400)
        
        response_data = {
            'code': code,
            'state': state
        }
        
        response = JsonResponse(response_data)
        response.delete_cookie('oauth2_state')
        
        return response
