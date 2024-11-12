from django.views import View
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.conf import settings
import json
import secrets
from ..utils.get_user_language import get_user_language
from asgiref.sync import async_to_sync

User = get_user_model()  
    
class twofactor_send_token_view(View):
    def __init__(self):
        super().__init__       


    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            self.check_data(data)
            self.request = request
            self.user = self.get_user(data['username'])
            if self.user.two_factor_method == 'email':
                return self._handle_email_method(data)
            elif self.user.two_factor_method == 'authenticator':
                return JsonResponse({'method': self.user.two_factor_method}, status=200)
            else:
                return JsonResponse({'message': 'We\'ve encountered an issue with the verification method.'}, status=400)
        except Exception as e:
            return JsonResponse({'message': f'An error occured with email sending: {str(e)}'}, status=400)


    def check_data(self, data):
        if not data['username']:
            raise Exception({'message': 'User not found'}, status=401)


    def get_user(self, username):
        user = User.objects.get(username=username)
        if user.is_verified == False:
            raise Exception({'message': 'two-factor authentication is not activated on your account'})
        return user


    def _handle_email_method(self, data):
        try:
            if not data['email_type']:
                raise Exception({'message': 'Unknown email type'})
            self.verification_code = self._generate_6_digits_code()
            email_message, email_subject = self.get_message_type_preset(data['email_type'])
            if email_message is None:
                raise Exception({'message': 'Unknown email type'})
            email_from = settings.EMAIL_HOST_USER
            recipient_list = [self.user.email, ]
            send_mail(email_subject, email_message, email_from, recipient_list)
            self.user.set_two_factor_code(self.verification_code, 5)
            return JsonResponse({'method': self.user.two_factor_method}, status=200)
        except Exception as error:
            return JsonResponse({'message': f'An error occurred with email sending : {str(error)}'}, status=400)


    def get_message_type_preset(self, email_type):
        if email_type == 'verify':
            return self.get_verify_message_by_language()
        if email_type == 'deactivation':
            return self.get_deactivation_message_by_language()
        return None, None
        
        
    def _generate_6_digits_code(self):
        code = secrets.randbelow(1000000)
        return f"{code:06d}"
    
    
    def get_verify_message_by_language(self):
        language = async_to_sync(get_user_language)(self.request)  
        print('----> LANGUAGE: ', language)
        
        match language:
            case 'en':
                subject='Two Factor Auth Verification'
                message=f"""
                    Hi {self.user.username},
    
                    To ensure a secure connection to KingPong, we have sent you this verification code.
                    please use the code below to finalize your connection.
    
                    Verification code : {self.verification_code}
    
                    This code is valid for a short period of time(5 minutes). Do not share this code with others.
    
                    If you have not requested this action, please ignore this email.
                """
                return message, subject
            case 'fr':
                subject='Vérification de l\'authentification à deux facteurs'
                message=f"""
                    Bonjour {self.user.username},
    
                    Pour garantir une connexion sécurisée à KingPong, nous vous avons envoyé ce code de vérification.
                    Veuillez utiliser le code ci-dessous pour finaliser votre connexion.
    
                    Code de vérification : {self.verification_code}
    
                    Ce code est valable pour une courte période de temps (5 minutes). Ne partagez pas ce code avec d'autres personnes.
    
                    Si vous n'avez pas demandé cette action, veuillez ignorer cet e-mail.
                """
                return message, subject
            case 'zh':
                subject='双因素验证'
                message=f"""
                    您好 {self.user.username}、
    
                    为确保与 KingPong 的安全连接，我们向您发送了此验证码。
                    请使用下面的验证码完成连接。
    
                    验证码 - {self.verification_code}
    
                    此验证码在短时间内 - 5分钟 - 有效。请勿与他人共享此验证码
    
                    如果您没有要求进行此操作，请忽略此邮件
                """
                return message, subject
            case _:
                raise Exception({'message': 'Unknown language'}) 
            
    def get_deactivation_message_by_language(self):
            language = async_to_sync(get_user_language)(self.request)
            print('----> LANGUAGE: ', language)

            match language:
                case 'en':
                    subject='Two Factor Auth Deactivation'
                    message=f"""
                        Hi {self.user.username},

                        To ensure the deactivation of your two-factor authentication on KingPong, we are sending you this verification code.
                        Please use it to finalize your deactivation.

                        Verification code : {self.verification_code}

                        This code is valid for a short period of time(5 minutes). Do not share this code with others.

                        If you have not requested this action, please ignore this email.
                    """
                    return message, subject
                case 'fr':
                    subject='Désactivation de l\'authentification à deux facteurs'
                    message=f"""
                        Bonjour {self.user.username},

                        Afin de garantir la désactivation de votre authentification à deux facteurs sur KingPong, nous vous envoyons ce code de vérification.
                        Veuillez l'utiliser pour finaliser votre désactivation.

                        Code de vérification : {self.verification_code}

                        Ce code est valable pour une courte période de temps (5 minutes). Ne partagez pas ce code avec d'autres personnes.

                        Si vous n'avez pas demandé cette action, veuillez ignorer cet e-mail.
                    """
                    return message, subject
                case 'zh':
                    subject='双因素认证停用'
                    message=f"""
                        您好 {self.user.username}、

                        为确保您在 KingPong 上的双因素身份验证停用，我们将向您发送此验证码。
                        请使用该验证码完成停用操作。

                        验证码 - {self.verification_code}

                        此验证码在短时间内 - 5分钟 - 有效。请勿与他人共享此验证码

                        如果您没有要求进行此操作，请忽略此邮件
                    """
                    return message, subject
                case _:
                    raise Exception({'message': 'Unknown language'})