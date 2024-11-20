from django.contrib.auth.models import AnonymousUser
from asgiref.sync import sync_to_async
from django.http import JsonResponse
from django.views import View
from ..models import User
import json

def get_user_by_id(user_id):
    user = User.objects.get(id=user_id)
    
    return user

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

class UpdateUser(View):
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
    
    
class AddNewUser(View):
    def __init__(self):
        super().__init__()
    
    async def get(self, request):
        return JsonResponse({"message": 'get request successfully reached'}, status=200)


    async def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            if not 'user_id' in data and not 'username' in data:
                raise Exception('requestMissingData')
            await sync_to_async(User.objects.create_user)(username=data['username'], user_id=data['user_id'])
            return JsonResponse({"message": 'user added with success'}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)