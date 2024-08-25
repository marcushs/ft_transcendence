from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from datetime import datetime
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
        if not all(key in data for key in ('email', 'username', 'user_id')):
            return JsonResponse({"message": 'Invalid request, missing some information'}, status=400)
        User.objects.create_user(email=data['email'], username=data['username'], user_id=data['user_id'])
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
        for field in ['username', 'email', 'is_verified', 'two_factor_method', 'status', 'last_active']:
            if field in data:
                if field is 'last_active':
                    setattr(request.user, field, datetime.now())
                else:
                    setattr(request.user, field, data[field])
        request.user.save()
        return JsonResponse({'message': 'User updated successfully'}, status=200)


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

class getUserInfos(View):
    def __init__(self):
        super().__init__
    
    def get(self, request):
        try:
            username = request.GET.get('q', '')
            users = User.objects.get(username=username)
            users_data = {
                'username': users.username,
                'profile_image': users.profile_image.url if users.profile_image else None,
                'profile_image_link': users.profile_image_link,
            }
            return JsonResponse({'status': 'success', 'message': users_data}, safe=False, status=200)
        except ObjectDoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'No users found'}, status=200)