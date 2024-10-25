from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from django.db.models import Q
from django.views import View
from asgiref.sync import sync_to_async
from ..models import User
import json
import requests
import httpx

class add_new_user(View):
    def __init__(self):
        super().__init__
    
    def get(self, request):
        return JsonResponse({"message": 'get request successfully reached'}, status=200)

    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        if not all(key in data for key in ('username', 'user_id')):
            return JsonResponse({"message": 'Invalid request, missing some information'}, status=400)
        User.objects.create_user(username=data['username'], user_id=data['user_id'])
        return JsonResponse({"message": 'user added with success'}, status=200)
    
class update_user(View): 
    def __init__(self):
        super().__init__
        
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

class check_username(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        username = request.GET.get('username')
        print(username) 
        if User.objects.filter(username=username).exists():
            return JsonResponse({"message": "Username already taken! Try another one.", "status": "Error"}, status=400)
        return JsonResponse({"message": "Username is free", "status": "Success"}, status=200)
    
class delete_user(View):
    def __init__(self):
        super().__init__

    def delete(self, request):
        id = request.DELET.get('id')
        if User.objects.filter(id=id).exists():
            user = User.objects.get(id=id)
        else:
            return JsonResponse({'message': 'User not found, no action taken', 'status': 'Success'}, status=204)
        username = user.username
        user.delete()
        return JsonResponse({'message': f'User {username} deleted successfully', 'status': "Success"}, status=200)
    
async def send_async_request(request_type, request, url, payload=None):
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
        
def send_sync_request(request_type, request, url, payload=None):
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
        if request_type is 'DELETE':
            response = requests.delete(url=url, headers=headers, cookies=cookies, data=json.dumps(payload))
        elif request_type is 'POST':
            response = requests.post(url=url, headers=headers, cookies=cookies, data=json.dumps(payload))
        else:
            raise Exception('unrecognized request type')
        if response.status_code == 200:
            return response
        else:
            response.raise_for_status()
    except Exception as e:
        raise Exception(f"An error occurred: {e}")
