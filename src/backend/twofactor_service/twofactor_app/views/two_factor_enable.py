from django.views import View
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from django.core.mail import send_mail
from django.conf import settings
from .two_factor_utils import twofactor_verify_view, send_update_request

import secrets
import pyotp
import json


class twofactor_enable_view(View):
    def __init__(self):
        super().__init__
        
    
    def post(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'you are not connected'}, status=403)
        if request.user.is_verified:
            return JsonResponse({'message': 'you\'ve already activated two-factor authentication on your account'}, status=403)
        data = json.loads(request.body.decode('utf-8'))
        method = data.get('method')
        twofactor_code = data.get('twofactor')
        if twofactor_code is not None:
            return self._verification_handler(request, twofactor_code, method)
        match method:
            case 'email':
                return self._email_handler(request)
            case 'authenticator':
                return self._authenticator_handler(request)
            case _:
                return JsonResponse({'message': 'We\'ve encountered an issue with the selected authentication method.'}, status=201)
        
    def _email_handler(self, request):
        # verification_code = secrets.token_hex(6)
        verification_code = self._generate_6_digits_code()
        subject='Two Factor Activation'
        message=f"""
                Hi {request.user.username},

                You have requested activation of double authentication on your KingPong account.
                To complete this activation, please use the code below:

                Verification code : {verification_code}

                This code is valid for a short period of time(5 minutes). Do not share this code with others.

                If you have not requested this action, please ignore this email.
                """
        recipient_list = [request.user.email]
        error_message = self._send_mail(subject, message, recipient_list)
        if error_message is not None:
            return JsonResponse({'message': error_message}, status=400)
        request.user.set_two_factor_code(verification_code, 5)
        return JsonResponse({'message': 'Email send'}, status=200)
   
    def _authenticator_handler(self, request):
        if not request.user.authenticator_secret:
            secret = pyotp.random_base32()
            request.user.authenticator_secret = secret
            request.user.save()
        try:
            totp = pyotp.TOTP(request.user.authenticator_secret)
            otpauth_url =  totp.provisioning_uri(request.user.email, issuer_name='KingPong')
        except Exception as error:
            return JsonResponse({'message': str(error)}, status=400)
        return JsonResponse({'message': 'QR code url generated', 'qrcode': otpauth_url, 'qrcode_token': request.user.authenticator_secret}, status=200)
    
    def _verification_handler(self, request, twofactor_code, method):
        if method is None:
            return JsonResponse({'message': 'We\'ve encountered an issue with the selected authentication method.'}, status=201)
        response = twofactor_verify_view(request, twofactor_code, method)
        if response.status_code != 200:
            return response
        request.user.two_factor_method = method
        request.user.is_verified = True
        request_response = send_update_request(request)
        if request_response.status_code != 200:
            return request_response
        request.user.save()
        return response

    def _send_mail(self, subject, message, recipient_list):
        email_from = settings.EMAIL_HOST_USER
        
        try:
            send_mail(subject, message, email_from, recipient_list)
            return None
        except Exception as error:
            return f'An error occurred with email sending : {str(error)}'
        
    def _generate_6_digits_code(self):
        code = secrets.randbelow(1000000)
        return f"{code:06d}"