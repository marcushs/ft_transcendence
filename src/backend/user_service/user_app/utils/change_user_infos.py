from .websocket_utils import notify_user_info_display_change
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from django.http import JsonResponse
from .user_utils import send_request
from django.views import View
import requests
import magic
import re


class ChangeUserInfosView(View):
    def __init__(self):
        super().__init__


    async def post(self, request):
        User = get_user_model()
        response = {}

        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'error': 'User not found'}, status=201) 

        try:
            self.check_update_error(User, request)
        except ValidationError as e:
            return JsonResponse(e.message_dict, status=409)

        if request.POST.get('username') and request.user.username != request.POST.get('username'):
            response.update(await self.change_username(User, request))
        if request.POST.get('email') and request.user.email != request.POST.get('email'):
            response.update(await self.change_email(User, request))
        if request.FILES.get('profile_image'):
            response.update(await self.change_profile_image(request))
        elif request.POST.get('profile_image_link'):
            response.update(await self.change_profile_image_link(request))
        else:
            return JsonResponse(response, status=201)
        
        
        return JsonResponse(response, status=201)
        



    async def check_update_error(self, User, request):
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


    async def check_username_errors(self, User, new_username, request):
        error = {}

        if sync_to_async(lambda: User.objects.filter(username=new_username).exists()) and new_username != request.user.username:
            error['username_error'] = f"Username '{new_username}' already exists"
            raise ValidationError(error)
        if len(new_username) > 12:
            error['username_error'] = f"Username must be less than 12 characters"
            raise ValidationError(error)
        if re.search(r"^[a-zA-Z0-9_-]+$", new_username) is None:
            error['username_error'] = f"Username must container only letters, numbers, _ , -"
            raise ValidationError(error)


    async def check_email_errors(self, User, new_email, request):
        error = {}

        if sync_to_async(lambda: User.objects.filter(email=new_email).exists())() and new_email != request.user.email:
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

  
    async def change_username(self, User, request):
        old_username = request.user.username
        request.user.username = request.POST.get('username')
        payload = {'username': request.user.username}
        try:
            await send_request(request_type='POST',request=request, url='http://twofactor:8000/twofactor/update_user/', payload=payload)
            await send_request(request_type='POST',request=request, url='http://auth:8000/auth/update_user/', payload=payload)
            await send_request(request_type='POST',request=request, url='http://friends:8000/friends/update_user/', payload=payload)
        except Exception:
            pass
        await sync_to_async(request.user.save)()
        await notify_user_info_display_change(request=request, change_info='username', old_value=old_username)

        return {'username_message': 'Username successfully changed'} 

    async def change_email(self, User, request):
        request.user.email = request.POST.get('email') 
        payload = {'email': request.user.email}
        
        try:
            await send_request(request_type='POST',request=request, url='http://twofactor:8000/twofactor/update_user/', payload=payload)
            await send_request(request_type='POST',request=request, url='http://auth:8000/auth/update_user/', payload=payload)
        except Exception:
            pass
        await sync_to_async(request.user.save)() 

        return {'email_message': 'Email successfully changed'}


    async def change_profile_image(self, request):
        new_image = request.FILES.get('profile_image')

        request.user.profile_image = new_image
        request.user.profile_image_link = None
        await sync_to_async(request.user.save)(has_new_image=True)
        await notify_user_info_display_change(request=request, change_info='picture')

        return {'profile-image_message': 'Profile image successfully changed'}


    async def change_profile_image_link(self, request):
        new_image_link = request.POST.get('profile_image_link')

        request.user.profile_image = None
        request.user.profile_image_link = new_image_link
        await sync_to_async(request.user.save)(has_new_image=True)
        await notify_user_info_display_change(request=request, change_info='picture')

        return {'profile-image_message': 'Profile image successfully changed'}
