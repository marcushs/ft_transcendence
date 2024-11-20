from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.views import View
from ..models import User
import requests
import httpx
import json


class DeleteUser(View):
    def __init__(self):
        super().__init__

    def delete(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            if not 'user_id' in data:
                raise Exception('missingID')
            user = User.objects.get(id=str(data['user_id']))
            user.delete()
            return JsonResponse({'message': 'User updated successfully'}, status=200)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=400)


class AddNewUser(View):
    def __init__(self):
        super().__init__


    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            if not all(key in data for key in ('username', 'user_id')):
                raise Exception('requestDataMissing')
            User.objects.create_user(username=str(data['username']), user_id=str(data['user_id']))
            return JsonResponse({"message": 'user added with success'}, status=200)
        except Exception as e:
                return JsonResponse({"message": str(e)}, status=400)
    
class update_user(View): 
    def __init__(self):
        super().__init__
    
    def post(self, request):
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'User not found'}, status=400)
            data = json.loads(request.body.decode('utf-8'))
            if 'username' in data:
                setattr(request.user, 'username', str(data['username']))
            request.user.save()
            return JsonResponse({'message': 'User updated successfully'}, status=200)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=400)
    
    
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
