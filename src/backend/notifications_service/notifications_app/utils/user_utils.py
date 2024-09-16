from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from django.views import View
from ..models import User
from asgiref.sync import sync_to_async
import json


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