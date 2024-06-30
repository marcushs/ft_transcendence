from django.views import View
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
import json
import secrets
import pyotp


class twoFactorEnableView(View):
    def __init__(self):
        super().__init__
    
    
    def get(self, request):
        return JsonResponse({'message': 'Correct verification code'}, status=201)
        
    
    def post(self, request):
        response = None
        
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'error': 'User (2fa)   not found'}, status=201)
        if request.user.is_verified:
            return JsonResponse({'error': 'you\'ve already activated two-factor authentication on your account'}, status=201)
        data = json.loads(request.body.decode('utf-8'))
        method = data.get('method')
        code = data.get('code')
        if code:
            response = self.checkVerificationCode(request, code, method)
            return response
        match method:
            case 'sms':
                response = self.smsHandler(request)
            case 'email':
                response = self.emailHandler(request)
            case 'authenticator':
                response = self.authenticatorHandler(request)
            case _:
                response = JsonResponse({'error': 'We\'ve encountered an issue with the selected authentication method.'}, status=201)
        if not hasattr(response, 'error'):
            request.user.two_factor_method = method
            request.user.save()
        return response
    
    def smsHandler(self, request):
        if not request.user.phonenumber:
            return JsonResponse({'error': 'no associated phone number'}, status=201)
        pass
    
    def emailHandler(self, request):
        verification_code = secrets.token_hex(6)
        subject = 'Two Factor Activation'
        message = f"""
            Hi {request.user.username},
            
            You have requested activation of double authentication on your KingPong account.
            To complete this activation, please use the code below:
            
            Verification code :     {verification_code}
            
            This code is valid for a short period of time. Do not share this code with others.

            If you have not requested this action, please ignore this email.
        """
        email_from = settings.EMAIL_HOST_USER
        recipient_list = [request.user.email, ]
        request.user.set_two_factor_code(verification_code, 5)
        send_mail(subject, message, email_from, recipient_list)
        return JsonResponse({'message': 'Email send'}, status=201)
    
    def authenticatorHandler(self, request):
        if not request.user.authenticator_secret:
            secret = pyotp.random_base32()
            request.user.authenticator_secret = secret
            request.user.save()
        totp = pyotp.TOTP(request.user.authenticator_secret)
        otpauth_url =  totp.provisioning_uri(request.user.email, issuer_name='KingPong')
        return JsonResponse({'message': 'QR code url generated', 'qrcode': otpauth_url}, status=201)
        
    
    def checkVerificationCode(self, request, code, method):
        if method == 'authenticator':
            totp = pyotp.TOTP(request.user.authenticator_secret)
            if not totp.verify(code):
                return JsonResponse({'error': 'Invalid verification code'}, status=201)
        else:
            if request.user.two_factor_code != code or request.user.two_factor_code_expiry < timezone.now():
                request.user.two_factor_method = None
                return JsonResponse({'error': 'Invalid verification code'}, status=201)
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