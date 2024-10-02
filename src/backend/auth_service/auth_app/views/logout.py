from django.http import JsonResponse, HttpResponse
from django.views import View
from ..decorator import check_jwt
from datetime import timezone
from .send_request import send_request_with_token
from django.utils.decorators import method_decorator

class logout_view(View):
    def __init__(self):
        super().__init__

    @method_decorator(check_jwt)
    def get(self, request):
        return HttpResponse(None, status=200)

    @method_decorator(check_jwt)
    def post(self, request):
        try:
            payload = { 'status': 'offline' }
            send_request_with_token(request_type='POST', request=request, url='http://user:8000/api/user/update_user/', payload=payload)
            response = JsonResponse({'message': 'Logout successfully', 'redirect_url': 'login'}, status=201)
            response.delete_cookie('jwt')
            response.delete_cookie('jwt_refresh')
            return response
        except Exception:
            pass
