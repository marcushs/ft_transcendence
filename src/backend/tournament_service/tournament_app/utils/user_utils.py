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
        if not all(key in data for key in ('username', 'user_id')):
            return JsonResponse({"message": 'Invalid request, missing some information'}, status=400)
        if User.objects.filter(username=data['username']).exists():
            return JsonResponse({'message': 'Username already taken! Try another one.', "status": "Error"}, status=400)
        if data['logged_in_with_oauth'] and data['logged_in_with_oauth'] is True:
            User.objects.create_oauth_user(data)
        else:
            User.objects.create_user(username=data['username'], user_id=data['user_id'], alias=data['username'])
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
        for field in ['username', 'is_verified', 'two_factor_method']:
            print(f'----------- field = {field} ------------') 
            if field in data:
                setattr(request.user, field, data[field])
        request.user.save()
        return JsonResponse({'message': 'User updated successfully'}, status=200)
