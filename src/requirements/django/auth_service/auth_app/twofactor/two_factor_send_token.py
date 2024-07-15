from django.views import View
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
import json
import secrets

User = get_user_model()

class twofactor_send_token_view(View):
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
        error_message = send_mail(subject, message, recipient_list)
        if error_message is not None:
            return JsonResponse({'message': error_message}, status=500)
        user.set_two_factor_code(verification_code, 5)
        return JsonResponse({'method': user.two_factor_method}, status=200)