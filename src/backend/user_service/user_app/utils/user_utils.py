from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from asgiref.sync import async_to_sync, sync_to_async
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Q
from django.views import View
from ..models import User
from django.contrib.auth import get_user_model
import httpx
import json
import jwt
from django.conf import settings


User = get_user_model()


def get_user_id_by_username(username):
    user = User.objects.get(username=username)
    
    return user.id

class set_offline_user(View):
    def __init__(self):
        super().__init__   

    async def post(self, request):
        from .websocket_utils import notify_user_info_display_change
        
        
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'User not found'}, status=400)
        request.user.last_active = timezone.now()
        if request.user.status == 'online' or request.user.status == 'away':
            old_status = request.user.status
            request.user.status = 'offline'
            await sync_to_async(request.user.save)()
            await notify_user_info_display_change(request=request, change_info='status', old_value=old_status)
        else:
            await sync_to_async(request.user.save)()
        return JsonResponse(status=200)
 
class ping_status_user(View):
    def __init__(self):
        super().__init__   

    async def post(self, request):
        from .websocket_utils import notify_user_info_display_change
        
        
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'status': 'fail', 'message': 'User not found'}, status=200)
        request.user.last_active = timezone.now()
        if request.user.status == 'offline' or request.user.status == 'away':
            old_status = request.user.status
            request.user.status = 'online'
            await sync_to_async(request.user.save)()
            await notify_user_info_display_change(request=request, change_info='status', old_value=old_status)
        else:
            await sync_to_async(request.user.save)()
        return JsonResponse({'status': 'success', "message": 'pong'}, status=200) 


class add_new_user(View):
    def __init__(self):
        super().__init__
    
    def get(self, request):
        return JsonResponse({"message": 'get request successfully reached'}, status=200)
    

    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        if not all(key in data for key in ('email', 'username', 'user_id')):
            return JsonResponse({"message": 'Invalid request, missing some information'}, status=400)
        if User.objects.filter(username=data['username']).exists():
            return JsonResponse({'message': 'Username already taken! Try another one.', "status": "Error"}, status=400)
        if User.objects.filter(email=data['email']).exists():
            return JsonResponse({'message': 'Email address already registered! Try logging in.', "status": "Error"}, status=400)
        if data['logged_in_with_oauth'] and data['logged_in_with_oauth'] is True:
            User.objects.create_oauth_user(data)
        else:
            User.objects.create_user(email=data['email'], username=data['username'], user_id=data['user_id'])
        return JsonResponse({"message": 'user added with success', "status": "Success"}, status=200)
    
class update_user(View):
    def __init__(self):
        super().__init__
        
    def get(self, request):
        return JsonResponse({"message": 'get request successfully reached'}, status=200) 
    
    def post(self, request):
        from .websocket_utils import notify_user_info_display_change
        
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'User not found'}, status=400)
        data = json.loads(request.body.decode('utf-8'))
        old_status = None
        for field in ['username', 'email', 'is_verified', 'two_factor_method', 'status', 'last_active']:
            if field in data:
                print('-----------> field:')
                if field == 'last_active':
                    setattr(request.user, field, timezone.now())
                elif field == 'status':
                    old_status = request.user.status
                    setattr(request.user, field, data[field])
                else:
                    setattr(request.user, field, data[field]) 
        request.user.save()
        if 'status' in data:
            async_to_sync(notify_user_info_display_change)(request=request, change_info='status', old_value=old_status)
        return JsonResponse({'message': 'User updated successfully'}, status=200) 

class check_username(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        username = request.GET.get('username')
        print(username) 
        if User.objects.filter(username=username).exists():
            return JsonResponse({"message": "Username already taken! Try another one.", "status": "Error"}, status=400)
        return JsonResponse({"message": "Username is free", "status": "Success"}, status=200)

async def send_request(request_type, url, request=None, payload=None):
    if request:
        headers, cookies = set_headers_cookies_request(request=request)
    else:
        headers, cookies = set_headers_cookies_request()
    try:
        async with httpx.AsyncClient() as client:
            if request_type == 'GET':
                response = await client.get(url, headers=headers, cookies=cookies)
            elif request_type == 'PUT':
                response = await client.put(url, headers=headers, cookies=cookies, content=json.dumps(payload))
            else:
                response = await client.post(url, headers=headers, cookies=cookies, content=json.dumps(payload))
            response.raise_for_status()  # Raise an exception for HTTP errors
            return response
    except httpx.HTTPStatusError as e:
        raise Exception(f"HTTP error occurred: {e}")
    except httpx.RequestError as e:
        raise Exception(f"An error occurred while requesting: {e}")
        
def set_headers_cookies_request(request=None):
    if request:
        headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': request.COOKIES.get('csrftoken')
            } 
        cookies = {
            'csrftoken': request.COOKIES.get('csrftoken'),
            'jwt': request.COOKIES.get('jwt'),
            'jwt_refresh': request.COOKIES.get('jwt_refresh'),
            }
    else:
        headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            } 
        cookies = None
    return headers, cookies

class searchUsers(View):
    def __init__(self):
        super().__init__
        
    def get(self, request):
        search_input = request.GET.get('q', '')
        if search_input == '':
            return JsonResponse({'status': 'empty', 'message': 'No input provided'}, status=200)
        users = User.objects.filter(Q(username__startswith=search_input)) # Filter users who username contains the search input
        if users.exists(): # Create a list of users in dictionary format
            users_list = [{
                'username': user.username,
                'profile_image': user.profile_image.url if user.profile_image else None,
                'profile_image_link': user.profile_image_link
                }
                for user in users
            ]
            return JsonResponse({'status': 'success', 'message': users_list}, safe=False, status=200)
        else:
            return JsonResponse({'status': 'error', 'message': 'No users found'}, status=200)

class getUserId(View):
    def __init__(self):
        super().__init__
    
    def get(self, request):
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'User not found'}, status=400)
            return JsonResponse({'status': 'success', 'id': request.user.id}, status=200)

@method_decorator(csrf_exempt, name='dispatch') 
class getUserGameInfo(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        try:
            username = request.GET.get('q', '')
            user = User.objects.get(username=username) 
            users_data = {
                'username': users.username,
                'profile_image': users.profile_image.url if users.profile_image else None,
                'profile_image_link': users.profile_image_link,
            }
            return JsonResponse({'status': 'success', 'message': users_data}, safe=False, status=200)   
        except ObjectDoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'No users found'}, status=200)

class getUserInfos(View):
    def __init__(self):
        super().__init__
    
    def get(self, request):
        try:
            username = request.GET.get('q', '')
            users = User.objects.get(username=username) 
            users_data = {
                'id': str(users.id),
                'username': users.username,
                'profile_image': users.profile_image.url if users.profile_image else None,
                'profile_image_link': users.profile_image_link,
                'status': users.status
            }
            return JsonResponse({'status': 'success', 'message': users_data}, safe=False, status=200)
        
        except ObjectDoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'No users found'}, status=200)

class getUserInfoById(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        try:
            id = request.GET.get('q', '')
            user = User.objects.get(id=id)
            user_data = {
                'id': str(user.id),
                'username': user.username,
                'profile_image': user.profile_image.url if user.profile_image else None,
                'profile_image_link': user.profile_image_link,
                'status': user.status
            }
            return JsonResponse({'status': 'success', 'user_data': user_data}, safe=False, status=200)
        except ObjectDoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'No users found'}, status=200)

class getUsersInfo(View):
    def __init__(self):
        super().__init__
 
    def get(self, request):
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'User not found'}, status=400)
            users_target = json.loads(request.GET.get('q', ''))
            users_list = []
            for user in users_target:
                username = user.get('username')
                user_data = User.objects.get(username=username)
                users_info = {
                    'id': user_data.id,
                    'username': user_data.username,
                    'profile_image': user_data.profile_image.url if user_data.profile_image else None,
                    'profile_image_link': user_data.profile_image_link,
                    'status': user_data.status
                }
                users_list.append(users_info)
            return JsonResponse({'status': 'success', 'message': users_list}, safe=False, status=200)
        except ObjectDoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'No users found'}, status=200)


class getUsernameById(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'User not found'}, status=400)

            target_id = request.GET.get('q', '')

            if not target_id:
                return JsonResponse({'status': 'error', 'message': 'No id provided'}, status=200)

            user = User.objects.get(id=target_id)
            return JsonResponse({'status': 'success', 'username': user.username}, status=200)
        except User.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'No user id found'}, status=200)

class getUserStatus(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        try:
            user_id = request.GET.get('userId')
            user = User.objects.get(id=user_id)
            return JsonResponse({'status': 'success', 'user_status': user.status}, safe=False, status=200)
        except ObjectDoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'No users found'}, status=200)
