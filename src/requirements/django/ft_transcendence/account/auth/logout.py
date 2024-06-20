from django.http import JsonResponse
from django.views import View

class logoutView(View):
    def __init__(self):
        super().__init__
    
    
    def post(self, request):
        if request.user.is_authenticated:
            response = JsonResponse({'message': 'Logout successfully', 'redirect_url': 'login'}, status=201)
            response.delete_cookie('jwt')
            response.delete_cookie('jwt_refresh')
            return response
        else:
            return JsonResponse({'error': 'You are not logged'}, status=401)