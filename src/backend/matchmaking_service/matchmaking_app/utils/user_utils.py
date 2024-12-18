from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import AnonymousUser
from asgiref.sync import sync_to_async
from django.http import JsonResponse
from django.views import View
from ..models import User
import httpx
import json


async def get_user_id_by_username(username):
    user = await sync_to_async(User.objects.get)(username=username)
    
    return user.id

def get_user_by_id(user_id):
    user = User.objects.get(id=user_id)
    
    return user

async def async_get_user_by_id(user_id):  
    try:
        user = await sync_to_async(User.objects.get)(id=user_id)
    except Exception as e:
        print(f'Error: {str(e)}')
    return user


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
        super().__init__()


    async def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            if not all(key in data for key in ('username', 'user_id')):
                raise ValidationError('requestDataMissing')
            await sync_to_async(User.objects.create_user)(username=str(data['username']), user_id=str(data['user_id']))
            return JsonResponse({"message": 'user added with success'}, status=200)
        except ValidationError as e:
            return JsonResponse({"message": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)


class update_user(View):
    def __init__(self):
        super().__init__()

    
    def post(self, request):
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'User not found'}, status=401)
            data = json.loads(request.body.decode('utf-8'))
            if 'username' in data:
                setattr(request.user, 'username', str(data['username']))
            request.user.save()
            return JsonResponse({'message': 'User updated successfully'}, status=200)
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


@method_decorator(csrf_exempt, name='dispatch') 
class getUser(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        try:
            username = request.GET.get('q', None)
            if username is None:
                return JsonResponse({'status': 'error', 'message': 'No username provided'}, status=200)
            user = User.objects.get(username=str(username)) 
            users_data = {
                'username': user.username,
                'profile_image': user.profile_image,
                'profile_image_link': user.profile_image_link,
            }
            return JsonResponse({'status': 'success', 'message': users_data}, safe=False, status=200)   
        except ObjectDoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'No users found'}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)
