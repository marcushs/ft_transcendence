from django.views import View
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
import json


class twoFactorEnableView(View):
    def __init__(self):
        super().__init__
    
    
    def post(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'error': 'User (2fa)   not found'}, status=404)
        data = json.loads(request.body.decode('utf-8'))
        method = data.get('method')
        match method:
            case 'sms':
                self.smsHandler(request)
            case 'email':
                self.emailHandler(request)
            case 'token':
                self.tokenHandler(request)
            case _:
                return JsonResponse({'error': 'We\'ve encountered an issue with the selected authentication method.'}, status=404)
        print('request issssssssssssss : ', method)
        return JsonResponse({'message': 'enable 2fa ok', 'user': request.user.to_dict()}, status=201)
    
    def smsHandler(self, request):
        pass
    
    def emailHandler(self, request):
        pass
    
    def tokenHandler(self, request):
        pass
    

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