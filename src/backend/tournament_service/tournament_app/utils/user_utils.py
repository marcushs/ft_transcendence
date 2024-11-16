from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from django.views import View
from ..models import User
import json
import httpx

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

class add_oauth_user(View):
    def __init__(self):
        super().__init__

    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        if not all(key in data for key in ('email', 'username')):
            return JsonResponse({"message": 'Invalid request, missing some information', "status": "Error"}, status=400)
        if User.objects.filter(email=data['email']).exists():
            return JsonResponse({'message': 'Email address already registered! Try logging in.', "status": "Error"}, status=400)
        if User.objects.filter(username=data['username']).exists():
            return JsonResponse({'message': 'Username already taken! Try another one.', "status": "Error"}, status=400)
        user = User.objects.create_oauth_user(data)
        return JsonResponse({"message": 'user added with success', "status": "Success", "user_id": user.id}, status=200)

    
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
