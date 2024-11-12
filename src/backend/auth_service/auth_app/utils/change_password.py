from django.views import View
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth.hashers import check_password
from django.contrib.auth.password_validation import validate_password
from django.http import JsonResponse


class ChangePassword(View):
    def __init__(self):
        super().__init__


    def post(self, request):
        User = get_user_model()

        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'error': 'User not found'}, status=401)

        print(request)
        password_error = self.check_password_errors(User,  request)
        if password_error:
            return JsonResponse(password_error, status=200)

        response = self.change_password(User, request)
        return JsonResponse(response, status=200)


    def check_password_errors(self, User, request):
        current_password = request.POST.get('current_password')
        new_password = request.POST.get('new_password')
        confirm_new_password = request.POST.get('confirm_new_password')
        error = {}

        if not current_password:
            return {'status': 'error', 'current_password': 'currentPasswordIsRequired'}
        if not new_password:
            return {'status': 'error', 'new_password': 'newPasswordIsRequired'}
        if not new_password:
            return {'status': 'error', 'confirm_new_password': 'confirmPasswordIsRequired'}

        if not check_password(current_password, request.user.password):
            return {'status': 'error', 'current_password': 'incorrectCurrentPassword'}
        if check_password(new_password, request.user.password):
            return {'status': 'error', 'new_password': 'samePassword'}
        if new_password != confirm_new_password:
            return {'status': 'error', 'confirm_new_password': 'passwordDoNotMatch'}

        try:
            validate_password(new_password)
        except ValidationError as error:
            return {'status': 'error', 'new_password': str(error.messages[0])}

        return None


    def change_password(self, User, request):
        request.user.set_password(request.POST.get('new_password'))
        request.user.save()
        return {'status': 'success', "message": "passwordSuccessfullyChanged"}