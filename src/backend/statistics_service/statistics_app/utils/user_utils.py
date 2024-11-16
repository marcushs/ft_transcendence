from django.contrib.auth.models import AnonymousUser
from asgiref.sync import sync_to_async
from django.http import JsonResponse
from django.views import View
from ..models import User
import json

def get_user_by_id(user_id):
    user = User.objects.get(id=user_id)
    
    return user

class update_user(View):
    def __init__(self):
        super().__init__()
        
    async def get(self, request):
        return JsonResponse({"message": 'get request successfully reached'}, status=200)
    
    async def post(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'User not found'}, status=400)
        data = json.loads(request.body.decode('utf-8'))
        if 'username' in data:
            setattr(request.user, 'username', data['username'])
        await sync_to_async(request.user.save)()
        return JsonResponse({'message': 'User updated successfully'}, status=200)
    
    
class add_new_user(View):
    def __init__(self):
        super().__init__()
    
    async def get(self, request):
        return JsonResponse({"message": 'get request successfully reached'}, status=200)


    async def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        if not 'user_id' in data and not 'username' in data:
            return JsonResponse({"message": 'Invalid request, missing some information'}, status=400)
        await sync_to_async(User.objects.create_user)(username=data['username'], user_id=data['user_id'])
        return JsonResponse({"message": 'user added with success'}, status=200)