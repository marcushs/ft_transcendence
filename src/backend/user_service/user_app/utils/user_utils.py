from django.core.exceptions import ObjectDoesNotExist, ValidationError
from asgiref.sync import async_to_sync, sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Q
from django.views import View
from ..models import User
import httpx
import json


User = get_user_model()


def get_user_id_by_username(username):
    user = User.objects.get(username=username) 
    
    return user.id

class set_offline_user(View):
    def __init__(self):
        super().__init__   

    async def post(self, request):
        from .websocket_utils import notify_user_info_display_change
        
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'User not found'}, status=401)
            request.user.last_active = timezone.now()
            if request.user.status == 'online' or request.user.status == 'away':
                old_status = request.user.status
                request.user.status = 'offline'
                await sync_to_async(request.user.save)()
                await notify_user_info_display_change(request=request, change_info='status', old_value=old_status)
            else:
                await sync_to_async(request.user.save)()
            return JsonResponse(status=200)
        except Exception as e:
            print(f'Error: {str(e)}')
            return JsonResponse({"message": str(e)}, status=502)
 
class ping_status_user(View):
    def __init__(self):
        super().__init__   

    async def post(self, request):
        from .websocket_utils import notify_user_info_display_change

        try:
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
        except Exception as e:
            print(f'Error: {str(e)}')
            return JsonResponse({"message": str(e)}, status=502)


class DeleteUser(View):
    def __init__(self):
        super().__init__

    def delete(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            if not 'user_id' in data:
                raise ValidationError('missingID')
            user = User.objects.get(id=str(data['user_id']))
            user.delete()
            return JsonResponse({'message': 'User updated successfully'}, status=200)
        except ObjectDoesNotExist as e:
            return JsonResponse({'message': str(e)}, status=404)
        except ValidationError as e:
            return JsonResponse({'message': str(e)}, status=400)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)


class AddNewUser(View):
    def __init__(self):
        super().__init__


    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))

            if not data.get('language'):
                data['language'] = 'en'

            if not all(key in data for key in ('email', 'username', 'user_id')):
                raise ValidationError('requestMissingData')
            if User.objects.filter(username=str(data['username'])).exists():
                raise ValidationError('usernameAlreadyTaken')
            if User.objects.filter(email=str(data['email'])).exists():
                return JsonResponse({'message': 'Email address already registered! Try logging in.', "status": "Error"}, status=409)
            if data['logged_in_with_oauth'] and data['logged_in_with_oauth'] is True:
                User.objects.create_oauth_user(data)
            else:
                User.objects.create_user(email=str(data['email']), username=str(data['username']), user_id=str(data['user_id']), language=str(data['language']))
            return JsonResponse({"message": 'user added with success', "status": "Success"}, status=200)
        except ValidationError as e:
            return JsonResponse({"message": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)

    
class update_user(View):
    def __init__(self):
        super().__init__


    def post(self, request):
        from .websocket_utils import notify_user_info_display_change
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'User not found'}, status=401)
            data = json.loads(request.body.decode('utf-8'))
            old_status = None
            for field in ['username', 'email', 'is_verified', 'two_factor_method', 'status', 'last_active']:
                if field in data:
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
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)

class check_username(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        try:
            username = request.GET.get('username')
            if not username:
                return JsonResponse({"message": "No username provided", "status": "Error"}, status=400)
            if User.objects.filter(username=str(username)).exists():
                user = User.objects.get(username=str(username))
                return JsonResponse({"message": "Username already taken! Try another one.", 
                                     "status": "Error", 
                                     "user_id": str(user.id)}, status=409)
            return JsonResponse({"message": "Username is free", "status": "Success"}, status=200)
        except ObjectDoesNotExist as e:
            return JsonResponse({"message": str(e)}, status=404)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)
 
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
        try:
            search_input = request.GET.get('q', None)
            if search_input is None:
                return JsonResponse({'status': 'empty', 'message': 'No input provided'}, status=200)
            users = User.objects.filter(Q(username__startswith=str(search_input))) # Filter users who username contains the search input
            if users.exists():
                users_list = [{
                    'username': user.username,
                    'profile_image': user.profile_image,
                    'profile_image_link': user.profile_image_link
                    }
                    for user in users
                ]
                return JsonResponse({'status': 'success', 'message': users_list}, safe=False, status=200)
            else:
                return JsonResponse({'status': 'error', 'message': 'No users found'}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)
        

class getClientUsername(View):
    def __init__(self):
        super().__init__
    
    def get(self, request):
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'User not found'}, status=401)
            return JsonResponse({'status': 'success', 'username': request.user.username}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)


class getUserId(View):
    def __init__(self):
        super().__init__
    
    def get(self, request):
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'User not found'}, status=401)
            return JsonResponse({'status': 'success', 'id': request.user.id}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch') 
class getUserGameInfo(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        try:
            username = request.GET.get('q', None)
            if username is None:
                return JsonResponse({'status': 'error', 'message': 'No username provided'}, status=400)
            user = User.objects.get(username=str(username))
            users_data = {
                'username': user.username,
                'profile_image': user.profile_image,
                'profile_image_link': user.profile_image_link,
            }
            return JsonResponse({'status': 'success', 'message': users_data}, safe=False, status=200)   
        except ObjectDoesNotExist as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=404)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)

class getUserInfos(View):
    def __init__(self):
        super().__init__
    
    def get(self, request):
        try:
            username = request.GET.get('q', None)
            if username is None:
                return JsonResponse({'status': 'error', 'message': 'No username provided'}, status=400)
            users = User.objects.get(username=str(username))
            users_data = {
                'id': str(users.id),
                'username': users.username,
                'profile_image': users.profile_image,
                'profile_image_link': users.profile_image_link,
                'status': users.status
            }
            return JsonResponse({'status': 'success', 'message': users_data}, safe=False, status=200)
        except ObjectDoesNotExist as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=404)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)

class getUserInfoById(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        try:
            id = request.GET.get('q', None)
            if id  is None:
                return JsonResponse({'status': 'error', 'message': 'No id provided'}, status=400)
            user = User.objects.get(id=str(id))
            user_data = {
                'id': str(user.id),
                'username': user.username,
                'profile_image': user.profile_image,
                'profile_image_link': user.profile_image_link,
                'status': user.status
            }
            return JsonResponse({'status': 'success', 'user_data': user_data}, safe=False, status=200)
        except ObjectDoesNotExist as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=404)
        except Exception as e:
            return JsonResponse({"message": str(e)}, )

class getUsersInfo(View):
    def __init__(self):
        super().__init__
 
    def get(self, request):
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'User not found'}, status=401)
            users_target = json.loads(request.GET.get('q', None))
            if users_target is None:
                return JsonResponse({'status': 'error', 'message': 'No users provided'}, status=400)
            users_list = []
            for user in users_target:
                username = user.get('username')
                user_data = User.objects.get(username=str(username))
                users_info = {
                    'id': user_data.id,
                    'username': user_data.username,
                    'profile_image': user_data.profile_image,
                    'profile_image_link': user_data.profile_image_link,
                    'status': user_data.status
                }
                users_list.append(users_info)
            return JsonResponse({'status': 'success', 'message': users_list}, safe=False, status=200)
        except ObjectDoesNotExist as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=404)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)


class getUsernameById(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'User not found'}, status=401)

            target_id = request.GET.get('q', None)

            if target_id is None:
                return JsonResponse({'status': 'error', 'message': 'No id provided'}, status=200)

            user = User.objects.get(id=str(target_id))
            return JsonResponse({'status': 'success', 'username': user.username}, status=200)
        except ObjectDoesNotExist as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=404)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)


class getUserStatus(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        try:
            user_id = request.GET.get('userId', None)
            if not user_id:
                return JsonResponse({'status': 'error', 'message': 'No id provided'}, status=200)
            user = User.objects.get(id=str(user_id))
            return JsonResponse({'status': 'success', 'user_status': user.status}, safe=False, status=200)
        except ObjectDoesNotExist as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=404)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)
