from django.http import JsonResponse, HttpResponse
from django.views import View
from ..decorator import check_jwt
from datetime import timezone
from .send_post_request import send_post_request_with_token
from django.utils.decorators import method_decorator

class logout_view(View):
    def __init__(self):
        super().__init__

    @method_decorator(check_jwt)
    def get(self, request):
        return HttpResponse(None, status=200)

    @method_decorator(check_jwt)
    def post(self, request):
        payload = { 'status': 'offline' }
        token = request.COOKIES.get('jwt')
        refresh_token = request.COOKIES.get('jwt_refresh')
        send_post_request_with_token(request=request, url='http://user:8000/user/update_user/', payload=payload, jwt=token, jwt_refresh=refresh_token)
        response = JsonResponse({'message': 'Logout successfully', 'redirect_url': 'login'}, status=201)
        response.delete_cookie('jwt')
        response.delete_cookie('jwt_refresh')
        return response
