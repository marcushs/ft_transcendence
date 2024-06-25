from django.views import View
from django.http import JsonResponse


class twoFactorEnableView(View):
    def __init__(self):
        super().__init__
    
    
    def post(self, request):
        if request.user.is_authenticated:
            return JsonResponse({'message': 'enable 2fa ok', 'user': request.user.to_dict()}, status=201)
        else:
            return JsonResponse({'error': 'User (2fa) not found'}, status=404)
    

class twoFactorDisableView(View):
    def __init__(self):
        super().__init__
    
    
    def post(self, request):
        pass


class twoFactorBackupView(View):
    def __init__(self):
        super().__init__
    
    
    def post(self, request):
        pass