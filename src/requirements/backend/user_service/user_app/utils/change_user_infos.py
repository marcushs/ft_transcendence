from django.views import View
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from .user_utils import send_post_request
import requests
import magic
import re


class ChangeUserInfosView(View):
    def __init__(self):
        super().__init__


    def post(self, request):
        User = get_user_model()
        response = {}

        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'error': 'User not found'}, status=201) 

        try:
            self.check_update_error(User, request)
        except ValidationError as e:
            return JsonResponse(e.message_dict, status=409)

        if request.POST.get('username') and request.user.username != request.POST.get('username'):
            response.update(self.change_username(User, request))
        if request.POST.get('email') and request.user.email != request.POST.get('email'):
            response.update(self.change_email(User, request))
        if request.FILES.get('profile_image'):
            response.update(self.change_profile_image(request))
        elif request.POST.get('profile_image_link'):
            response.update(self.change_profile_image_link(request))

        
        return JsonResponse(response, status=201)


    def check_update_error(self, User, request):
        new_username = request.POST.get('username')
        new_email = request.POST.get('email')
        new_profile_image = request.FILES.get('profile_image')
        new_profile_image_link = request.POST.get('profile_image_link')

        if new_username is not None:
            self.check_username_errors(User, new_username, request)
        if new_email is not None:
            self.check_email_errors(User, new_email, request)
        if new_profile_image is not None:
            self.check_profile_image_errors(new_profile_image)
        elif new_profile_image_link is not None:
            self.check_profile_image_link_errors(new_profile_image_link)


    def check_username_errors(self, User, new_username, request):
        error = {}

        if User.objects.filter(username=new_username).exists() and new_username != request.user.username:
            error['username_error'] = f"Username '{new_username}' already exists"
            raise ValidationError(error)
        if len(new_username) > 12:
            error['username_error'] = f"Username must be less than 12 characters"
            raise ValidationError(error)
        if re.search(r"^[a-zA-Z0-9_-]+$", new_username) is None:
            error['username_error'] = f"Username must container only letters, numbers, _ , -"
            raise ValidationError(error)


    def check_email_errors(self, User, new_email, request):
        error = {}

        if User.objects.filter(email=new_email).exists() and new_email != request.user.email:
            error['email_error'] = f'Email {new_email} is already associated with an account'
            raise ValidationError(error)
        if re.search(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", new_email) is None:
            error['email_error'] = f'Invalid email format'
            raise ValidationError(error)


    def check_profile_image_errors(self, new_profile_image):
        error = {}
        mime = magic.Magic(mime=True)
        myme_type = mime.from_buffer(new_profile_image.read()) # get the mime of the image

        valid_mime_type = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp']
        print(myme_type)
        if myme_type not in valid_mime_type:
            error['profile-image_error'] = f'Invalid profile image format, valid formats are: (png, jpg, jpeg, gif, svg, webp)'
            raise ValidationError(error)


    def check_profile_image_link_errors(self, new_profile_image_link):
        try:
            response = requests.get(new_profile_image_link, stream=True) # stream=True to don't download the body, just the header
            if response.status_code == 200 and 'image' in response.headers.get('Content-type', '').lower():
                return True
            return False
        except requests.RequestException:
            return False

  
    def change_username(self, User, request):
        request.user.username = request.POST.get('username')
        payload = {'username': request.user.username}
        response = send_post_request(request=request, url='http://twofactor:8000/api/twofactor/update_user/', payload=payload)
        response = send_post_request(request=request, url='http://auth:8000/api/auth/update_user/', payload=payload)
        request.user.save()

        return {'username_message': 'Username successfully changed'}

    def change_email(self, User, request):
        request.user.email = request.POST.get('email')
        payload = {'email': request.user.email}

        send_post_request(request=request, url='http://twofactor:8000/api/twofactor/update_user/', payload=payload)
        send_post_request(request=request, url='http://auth:8000/api/auth/update_user/', payload=payload)
        request.user.save()

        return {'email_message': 'Email successfully changed'}


    def change_profile_image(self, request):
        new_image = request.FILES.get('profile_image')

        request.user.profile_image = new_image
        request.user.profile_image_link = None
        request.user.save()

        return {'profile-image_message': 'Profile image successfully changed'}


    def change_profile_image_link(self, request):
        new_image_link = request.POST.get('profile_image_link')

        request.user.profile_image = None
        request.user.profile_image_link = new_image_link
        request.user.save()

        return {'profile-image_message': 'Profile image successfully changed'}
