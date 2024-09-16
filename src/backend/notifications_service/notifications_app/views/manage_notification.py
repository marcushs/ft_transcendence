from django.http import JsonResponse
from ..models import Notification
from django.contrib.auth import get_user_model
from django.views import View
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone
from datetime import timedelta
from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from ..utils.user_utils import get_user_id_by_username
import json
import redis

User = get_user_model()

class manage_notification_view(View):
    def __init__(self):
        super().__init__()


    async def get(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'status':'error', 'message': 'No connected user'}, status=200)
        
        redis_client = redis.Redis(host='redis', port=6379)
        redis_client.publish('notifications', 'New notification for user')
        
        own_notifications = await sync_to_async(Notification.objects.filter)(receiver=request.user)
        notifications_dict = await sync_to_async(self.get_notification_dict)(notifications=own_notifications)
        return JsonResponse({"status": "success", 'message': notifications_dict}, status=200)


    def get_notification_dict(self, notifications):
        notifications_list = []
        for index, notification in enumerate(notifications):
            notifications_list.insert(index, notification.to_dict())
        return notifications_list


    async def put(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'status':'error', 'message': 'No connected user'}, status=200)
        data = json.loads(request.body.decode('utf-8'))
        check_response = await sync_to_async(self.check_put_data)(data=data)
        if check_response != 'Success':
            return JsonResponse({'status': 'error', 'message': check_response}, status=200)
        await self.set_notifications_as_read(data=data)
        return JsonResponse({"status": "success"}, status=200)


    async def set_notifications_as_read(self, data):
        for notification_id in data['uuids']:
            try:
                notification = await sync_to_async(Notification.objects.get)(uuid=notification_id)
                notification.is_read = True
                notification.is_read_at = timezone.now()
                await sync_to_async(notification.save)()
            except Exception:
                pass
            
    
    async def delete(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'status':'error', 'message': 'No connected user'}, status=200)
        data = json.loads(request.body.decode('utf-8'))
        check_response = await sync_to_async(self.check_delete_data)(data=data)
        if check_response != 'Success':
            return JsonResponse({'status': 'error', 'message': check_response}, status=200)
        try:
            notification = await sync_to_async(Notification.objects.get)(uuid=data['uuid'])
            # self.send_delete_notification_to_channel(notification)
            await sync_to_async(notification.delete)()
        except User.DoesNotExist:
            pass
        return JsonResponse({"status": "success"}, status=200)


    async def post(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'status':'error', 'message': 'No connected user'}, status=200)
        data = json.loads(request.body.decode('utf-8'))
        check_response = await self.check_post_data(data=data)
        if check_response != 'Success':
            return JsonResponse({'status': 'error', 'message': check_response}, status=200)


        notifications_types = ['friend-request-accepted', 'friend-request-pending', 'private-match-invitation', 'tournament-invitation']
        notifications_messages = [
                f'{request.user.username} has accepted your friend request.',
                f'You have a new friend request from {request.user.username}.',
                f'{request.user.username} has invited you to a private game.',
                f'{request.user.username} has invited you to join a tournament.'
            ]

        for index, notification_type in enumerate(notifications_types):
            if data['type'] == notification_type:
                message = notifications_messages[index]
                notification = await sync_to_async(Notification.objects.create)(sender=request.user, receiver=self.receiver, type=notification_type,message=message)
                await self.send_new_notification_to_channel(notification)
                return JsonResponse({"status": "success"}, status=200)

        return JsonResponse({'status': 'error', 'message': 'unknown notification type'}, status=200)


    async def check_post_data(self, data):
        if not data['receiver'] or not data['type']:
            return 'Missing attributes'
        if data['receiver'] is None or data['type'] is None:
            return 'some attributes are empty'
        try:
            self.receiver = await sync_to_async(User.objects.get)(username=data['receiver'])
        except User.DoesNotExist:
            return 'Sender user not found'
        return 'Success'


    def check_put_data(self, data):
        if not data['uuids']:
            return 'Missing attributes'
        if data['uuids'] is None:
            return 'Notification id is missing'
        return 'Success'


    def check_delete_data(self, data):
        if not data['uuid']:
            return 'Missing attributes'
        if data['uuid'] is None:
            return 'Notification id  is missing'
        return 'Success'


    async def send_new_notification_to_channel(self, notification):
        channel_layer = get_channel_layer()
        user_id = await get_user_id_by_username(self.receiver)
        
        await channel_layer.group_send(
            f'user_{user_id}',
            {
                'type': 'new_notification',
                'notification': notification.to_dict()
            }
        )
        
    async def send_delete_notification_to_channel(self, notification):
        print('------------------ DELETE -------------------------')
        channel_layer = get_channel_layer()
        user_id = await get_user_id_by_username(self.receiver)
        
        await channel_layer.group_send(
            f'user_{user_id}',
            {
                'type': 'delete_notification',
                'notification': notification.to_dict()
            }
        )