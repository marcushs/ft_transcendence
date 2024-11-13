from asgiref.sync import sync_to_async
from django.http import JsonResponse
from django.views import View
from ..models import User
import json

def get_user_by_id(user_id):
    user = User.objects.get(id=user_id)
    
    return user


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
    
class check_username(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        username = request.GET.get('username')
        print(username) 
        if User.objects.filter(username=username).exists():
            return JsonResponse({"message": "Username already taken! Try another one.", "status": "Error"}, status=400)
        return JsonResponse({"message": "Username is free", "status": "Success"}, status=200)
