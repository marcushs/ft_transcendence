from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.utils import timezone
from django.views import View
import pyotp
import json

User = get_user_model()

class two_factor_login_check(View):
    def __init__(self):
        super().__init__

    
    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            user = User.objects.get(username=str(data['username']))
            code = data.get('twofactor')
            if not code:
                    return JsonResponse({'message': 'emptyCode'}, status=400)
            if user.two_factor_method == 'authenticator':
                totp = pyotp.TOTP(user.authenticator_secret)
                if not totp.verify(code):
                    return JsonResponse({'message': 'invalidCode'}, status=400)
            elif user.two_factor_method == 'email':
                if user.two_factor_code != code or user.two_factor_code_expiry < timezone.now():
                    return JsonResponse({'message': 'invalidCode'}, status=400)
            else:
                return JsonResponse({'message': 'invalidMethod'}, status=400)
            return JsonResponse({'message': 'twofactor login success'}, status=200)
        except ObjectDoesNotExist:
            return JsonResponse({'message': 'unknownUser'}, status=404) 
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)