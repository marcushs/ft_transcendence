from django.views import View
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from django.core.mail import send_mail
from django.conf import settings
from .two_factor_utils import twofactor_verify_view, send_update_request
from ..utils.get_user_language import get_user_language
from asgiref.sync import async_to_sync

import secrets
import pyotp
import json


class twofactor_enable_view(View):
    def __init__(self):
        super().__init__
        
    
    def post(self, request):
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'notConnected'}, status=403)
            if request.user.is_verified:
                return JsonResponse({'message': 'twoFactorAlreadyActivated'}, status=403)
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
                    return JsonResponse({'message': 'We\'ve encountered an issue with the selected authentication method.'}, status=400)
        except Exception as e:
            print('Unexpected Error: ', str(e))
            return JsonResponse({'message': 'unknownError'}, status=400)

       
    def _email_handler(self, request):
        language = async_to_sync(get_user_language)(request, request.user.username) 
        verification_code = self._generate_6_digits_code()
        match language:
            case 'en':
                subject='Two Factor Auth Activation'
                message=f"""
                    Hi {request.user.username},
    
                    You have requested activation of double authentication on your KingPong account.
                    To complete this activation, please use the code below:
    
                    Verification code : {verification_code}
    
                    This code is valid for a short period of time(5 minutes). Do not share this code with others.
    
                    If you have not requested this action, please ignore this email.
                """
            case 'fr':
                subject='Activation de l\'authentification à deux facteurs'
                message=f"""
                    Bonjour {request.user.username},
    
                    Vous avez demandé l'activation de la double authentification sur votre compte KingPong.
                    Pour compléter cette activation, veuillez utiliser le code ci-dessous :
    
                    Code de vérification : {verification_code}
    
                    Ce code est valable pour une courte période de temps (5 minutes). Ne partagez pas ce code avec d'autres personnes.
    
                    Si vous n'avez pas demandé cette action, veuillez ignorer cet e-mail.
                """
            case 'zh':
                subject='双因素激活'
                message=f"""
                    您好 {request.user.username}、
    
                    您请求在 KingPong 帐户上激活双重认证。
                    要完成激活，请使用下面的验证码
    
                    验证码 - {verification_code}
    
                    此验证码在短时间内 - 5分钟 - 有效。请勿与他人共享此验证码
    
                    如果您没有要求进行此操作，请忽略此邮件
                """
            case _:
                return JsonResponse({'message': 'An error occured with email sending: language not found'}, status=400)
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
            print(f'Error: authenticator: {str(error)}')
            return JsonResponse({'message': 'authenticatorError'}, status=400)
        return JsonResponse({'qrcode': otpauth_url, 'qrcode_token': request.user.authenticator_secret}, status=200)
    
    def _verification_handler(self, request, twofactor_code, method):
        if method is None:
            return JsonResponse({'message': 'invalidMethod'}, status=400)
        response = twofactor_verify_view(request, twofactor_code, method)
        if response.status_code != 200:
            return response
        request.user.two_factor_method = method
        request.user.is_verified = True
        send_update_request(request)
        request.user.save()
        return response

    def _send_mail(self, subject, message, recipient_list):
        email_from = settings.EMAIL_HOST_USER
        
        try:
            send_mail(subject, message, email_from, recipient_list)
            return None
        except Exception as error:
            print(f'An error occurred with email sending : {str(error)}')
            return 'emailError'
        
    def _generate_6_digits_code(self):
        code = secrets.randbelow(1000000)
        return f"{code:06d}"