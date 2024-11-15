from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from django.views import View
from ..models import User
from asgiref.sync import sync_to_async
import json
import httpx


async def get_user_id_by_username(username):
    user = await sync_to_async(User.objects.get)(username=username)
    
    return user.id


class add_new_user(View):
    def __init__(self):
        super().__init__()
    
    async def get(self, request):
        return JsonResponse({"message": 'get request successfully reached'}, status=200)


    async def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        if not all(key in data for key in ('username', 'user_id')):
            return JsonResponse({"message": 'Invalid request, missing some information'}, status=400)
        await sync_to_async(User.objects.create_user)(username=data['username'], user_id=data['user_id'])
        return JsonResponse({"message": 'user added with success'}, status=200)
    
class update_user(View):
    def __init__(self):
        super().__init__()
        
    def get(self, request):
        return JsonResponse({"message": 'get request successfully reached'}, status=200)
    
    def post(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'User not found'}, status=400)
        data = json.loads(request.body.decode('utf-8'))
        if 'username' in data:
            setattr(request.user, 'username', data['username'])
        request.user.save()
        return JsonResponse({'message': 'User updated successfully'}, status=200)

async def send_request(request_type, request, url, payload=None):
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
        try:
            async with httpx.AsyncClient() as client:
                if request_type == 'GET':
                    response = await client.get(url, headers=headers, cookies=cookies)
                else:
                    response = await client.post(url, headers=headers, cookies=cookies, content=json.dumps(payload))

                response.raise_for_status()  # Raise an exception for HTTP errors
                return response
        except httpx.HTTPStatusError as e:
            raise Exception(f"HTTP error occurred: {e}")
        except httpx.RequestError as e:
            raise Exception(f"An error occurred while requesting: {e}")
