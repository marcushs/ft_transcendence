from django.views import View
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
from django.core.mail import send_mail
import json
import secrets


class twoFactorEnableView(View):
    def __init__(self):
        super().__init__
    
    
    def get(self, request):
        return JsonResponse({'message': 'Correct verification code'}, status=201)
        
    
    def post(self, request):
        response = None
        
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'error': 'User (2fa)   not found'}, status=404)
        data = json.loads(request.body.decode('utf-8'))
        code = data.get('code')
        print('code: ', code)
        if code:
            response = self.checkVerificationCode(request, code)
            return response
        method = data.get('method')
        match method:
            case 'sms':
                response = self.smsHandler(request)
            case 'email':
                response = self.emailHandler(request)
            case 'token':
                response = self.tokenHandler(request)
            case _:
                response = JsonResponse({'error': 'We\'ve encountered an issue with the selected authentication method.'}, status=404)
        return response
    
    def smsHandler(self, request):
        if not request.user.phonenumber:
            return JsonResponse({'error': 'no associated phone number'}, status=404)
        pass
    
    def emailHandler(self, request):
        verification_code = secrets.token_hex(6)
        subject = 'Two Factor Activation'
        message = f"""
            Hi {request.user.username},
            
            You have requested activation of double authentication on your King-Pong account.
            To complete this activation, please use the code below:
            
            Verification code :     {verification_code}
            
            This code is valid for a short period of time. Do not share this code with others.

            If you have not requested this action, please ignore this email.
        """
        email_from = settings.EMAIL_HOST_USER
        recipient_list = [request.user.email, ]
        request.user.two_factor_token = verification_code
        request.user.save()
        send_mail(subject, message, email_from, recipient_list)
        return JsonResponse({'message': 'Email send'}, status=201)
    
    def tokenHandler(self, request):
        pass
    
    def checkVerificationCode(self, request, code):
        if request.user.two_factor_token != code:
            return JsonResponse({'error': 'Invalid verification code'}, status=404)
        request.user.is_verified = True
        request.user.save()
        return JsonResponse({'message': 'Valid verification code'}, status=201)
    

class twoFactorDisableView(View):
    def __init__(self):
        super().__init__
    
    
    def post(self, request):
        request.user.is_verified = False
        request.user.save()
        return JsonResponse({'message': 'Two factor authentification disabled'}, status=201)


class twoFactorBackupView(View):
    def __init__(self):
        super().__init__
    
    
    def post(self, request):
        pass