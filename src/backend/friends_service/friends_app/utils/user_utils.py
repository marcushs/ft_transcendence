from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from django.db.models import Q
from django.views import View
from ..models import User
import json
import requests

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
    
    def get(self, request):
        return JsonResponse({'message': 'Method not allowed', 'status': 'Error'}, status=405)

    def post(self, request):
        return JsonResponse({'message': 'Method not allowed', 'status': 'Error'}, status=405)

def send_post_request(request, url, payload):
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
        response = requests.post(url=url, headers=headers, cookies=cookies ,data=json.dumps(payload))
        if response.status_code == 200:
            return JsonResponse({'message': 'success'}, status=200)
        else:
            response_data = json.loads(response.text)

            message = response_data.get('message')
            return JsonResponse({'message': message}, status=400)
