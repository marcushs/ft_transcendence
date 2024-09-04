from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from django.views import View
from ..models import User
import json

class add_new_user(View):
    def __init__(self):
        super().__init__
    
    def get(self, request):
        return JsonResponse({"message": 'get request successfully reached'}, status=200)


    def post(self, request):
        print('------------------------------------------------ TEST --------------------------------------------')
        data = json.loads(request.body.decode('utf-8'))
        if not all(key in data for key in ('username', 'user_id')):
            print('fail!')
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