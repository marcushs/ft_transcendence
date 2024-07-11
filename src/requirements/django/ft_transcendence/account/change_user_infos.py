from django.views import View
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
import re


class ChangeUserInfosView(View):
    def __init__(self):
        super.__init__


    def post(self, request):
        User = get_user_model()
        response = {}

        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'error': 'User not found'}, status=201)

        try:
            self.check_update_error(User, request)
        except ValidationError as e:
            return JsonResponse({'error': str(e)}, status=409)

        if request.user.username != request.POST.get('username'):
            response.update(self.change_username(User, request))
        if request.user.email != request.POST.get('email'):
            response.update(self.change_email(User, request))
        response.update(self.change_profile_image(request))

        return JsonResponse(response, status=201)


    def check_update_error(self, User, request):
        new_username = request.POST.get('username')
        new_email = request.POST.get('email')

        if new_username is not None:
            if User.objects.filter(username=new_username).exists() and new_username != request.user.username:
                raise ValidationError(f"Username '{new_username}' already exists")
            if len(new_username) > 12:
                raise ValidationError(f"Username must be less than 12 characters")

        if new_email is not None:
            if User.objects.filter(email=new_email).exists() and new_email != request.user.email:
                raise ValidationError(f'Email {new_email} is already associated with an account')
            if re.search(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", new_email) is None:
                raise ValidationError(f'Invalid email format')


    def change_username(self, User, request):
        response = {}

        response['username_message'] = 'Username has been successfully changed'
        request.user.username = request.POST.get('username')
        request.user.save()
        return response


    def change_email(self, User, request):
        response = {}

        response['email_message'] = 'Email has been successfully changed'
        request.user.email = request.POST.get('email')
        request.user.save()
        return response


    def change_profile_image(self, request):
        new_image = request.FILES.get('profile_image')
        response = {}

#         if new_image == request.user.profile_image or new_image is None:
#             response['image_conflict'] = 'Profile image is the same'
#         else:
        response['image_message'] = 'Profile image has been successfully changed'
        request.user.profile_image = new_image
        request.user.save()
        return response
