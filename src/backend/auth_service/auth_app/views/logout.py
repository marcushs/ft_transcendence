from .send_request import send_request_with_token
from django.http import JsonResponse
from django.views import View

class logout_view(View):
    def __init__(self):
        super().__init__

    def post(self, request):
        try:
            payload = { 'status': 'offline' }
            send_request_with_token(request_type='POST', request=request, url='http://user:8000/api/user/update_user/', payload=payload)
            response = JsonResponse({'message': 'Logout successfully'}, status=201)
            response.delete_cookie('jwt')
            response.delete_cookie('jwt_refresh')
            return response
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=502)
