from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from django.views import View
from ..models import User
from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
import json


async def get_user_uuid_by_username(username):
    user = await sync_to_async(User.objects.get)(username=username)
    
    return user.uuid


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
        print('--------------------------------- >>>>>>>>>>>>>>>>> test = ', request.user, data['username'])
        await sync_to_async(request.user.save)()
        await self.send_new_notification_to_channel(data['username'])
        return JsonResponse({'message': 'User updated successfully'}, status=200)

    async def send_new_notification_to_channel(self, new_username):
        channel_layer = get_channel_layer()
        user_uuid = await get_user_uuid_by_username(new_username)
        print(f'---------------- UUID =========== {user_uuid}')
        
        # await channel_layer.group_send(
            # f'user_{user_id}',
        #     {
        #         'type': 'new_notification',
        #         'notification': notification.to_dict()
        #     }
        # )