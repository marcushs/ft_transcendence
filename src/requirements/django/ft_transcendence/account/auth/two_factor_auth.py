from django.views import View
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from django.contrib.auth import get_user_model
import json
import secrets
import pyotp

User = get_user_model()
class twoFactorEnableView(View):
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
        verification_code = secrets.token_hex(6)
        subject='Two Factor Activation'
        message=f"""
                Hi {request.user.username},

                You have requested activation of double authentication on your KingPong account.
                To complete this activation, please use the code below:

                Verification code : {verification_code}

                This code is valid for a short period of time(5 minutes). Do not share this code with others.

                If you have not requested this action, please ignore this email.
                """
        recipient_list = [request.user.email, ]
        error_message = _send_mail(subject, message, recipient_list)
        if error_message is not None:
            return JsonResponse({'message': error_message}, status=500)
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
            return JsonResponse({'message': str(error)}, status=500)
        return JsonResponse({'message': 'QR code url generated', 'qrcode': otpauth_url, 'qrcode_token': request.user.authenticator_secret}, status=200)
    
    def _verification_handler(self, request, twofactor_code, method):
        if method is None:
            return JsonResponse({'message': 'We\'ve encountered an issue with the selected authentication method.'}, status=201)
        response = _two_factor_verify_view(request, twofactor_code, method)
        if response.status_code != 200:
            return response
        request.user.two_factor_method = method
        request.user.is_verified = True
        request.user.save()
        return response
        
def _send_mail(subject, message, recipient_list):
        email_from = settings.EMAIL_HOST_USER
        
        try:
            send_mail(subject, message, email_from, recipient_list)
            return None
        except Exception as error:
            return f'An error occurred with email sending : {str(error)}'
class getTwoFactorCodeView(View):
    def __init__(self):
        super().__init__
    
    def get(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'User not found'}, status=401)
        if request.user.two_factor_method == 'email':
            EmailMessageSetting = """
                To ensure the deactivation of your two-factor authentication on KingPong, we are sending you this verification code.
                Please use it to finalize your deactivation.
            """
            return self._handle_email_method(request.user, 'Two Factor Deactivation', EmailMessageSetting)
        return JsonResponse({'method': request.user.two_factor_method}, status=200)
            
    
    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        if not data['username']:
            return JsonResponse({'message': 'User not found'}, status=401)
        user = User.objects.get(username=data['username'])
        if user.is_verified == False:
            return JsonResponse({'message': 'two-factor authentication is not activated on your account'}, status=400)
        if user.two_factor_method == 'email':
            EmailMessageSetting = """
                To ensure a secure connection to KingPong, we have sent you this verification code.
                please use the code below to finalize your connection.
            """
            return self._handle_email_method(user, 'Two Factor Verification', EmailMessageSetting)
        elif user.two_factor_method == 'authenticator':
            return JsonResponse({'method': user.two_factor_method}, status=200)
        else:
            return JsonResponse({'message': 'We\'ve encountered an issue with the verification method.'}, status=400)
        
    def _handle_email_method(self, user, subject, EmailMessageSetting):
        verification_code = secrets.token_hex(6)
        message=f"""
                Hi {user.username},
                
                {EmailMessageSetting}

                Verification code : {verification_code}

                This code is valid for a short period of time(5 minutes). Do not share this code with others.

                If you have not requested this action, please ignore this email.
                """
        recipient_list = [user.email, ]
        error_message = _send_mail(subject, message, recipient_list)
        if error_message is not None:
            return JsonResponse({'message': error_message}, status=500)
        user.set_two_factor_code(verification_code, 5)
        return JsonResponse({'method': user.two_factor_method}, status=200)

def _two_factor_verify_view(request, two_factor_code, two_factor_method):
    if two_factor_method == 'authenticator':
        totp = pyotp.TOTP(request.user.authenticator_secret)
        if not totp.verify(two_factor_code):
            return JsonResponse({'message': 'Invalid Twofactor code'}, status=400)
    elif two_factor_method == 'email':
        if request.user.two_factor_code != two_factor_code:
            return JsonResponse({'message': 'Invalid Twofactor code'}, status=400)
        if request.user.two_factor_code_expiry < timezone.now():
            return JsonResponse({'message': 'Expired Twofactor code'}, status=400)
    else:
        return JsonResponse({'message': 'We\'ve encountered an issue with the TwoFactor method.'}, status=400)
    return JsonResponse({'message': 'successful two-factor authentication'}, status=200)

class twoFactorDisableView(View):
    def __init__(self):
        super().__init__
    
    
    def post(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'User not found'}, status=401)
        if request.user.is_verified == False:
            return JsonResponse({'message': 'Two factor authentification not set on your account'}, status=400)
        data = json.loads(request.body.decode('utf-8'))
        code = data.get('code')
        if not code:
                return JsonResponse({'message': 'Verification code missing'}, status=400)
        if request.user.two_factor_method == 'authenticator':
            totp = pyotp.TOTP(request.user.authenticator_secret)
            if not totp.verify(code):
                return JsonResponse({'message': 'Invalid verification code'}, status=400)
        elif request.user.two_factor_method == 'email':
            if request.user.two_factor_code != code or request.user.two_factor_code_expiry < timezone.now():
                return JsonResponse({'message': 'Invalid verification code'}, status=400)
        else:
            return JsonResponse({'message': 'We\'ve encountered an issue with the verification method.'}, status=400)
        request.user.authenticator_secret = None
        request.user.two_factor_method = ''
        request.user.is_verified = False
        request.user.save()
        return JsonResponse({'message': 'Two factor authentification disabled'}, status=200)