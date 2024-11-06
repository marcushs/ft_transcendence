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

User = get_user_model()

class manage_notification_view(View):
    def __init__(self):
        super().__init__()


    async def get(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'status':'error', 'message': 'No connected user'}, status=200)
        
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
        if data['type'] == 'set_as_read':
            await self.set_notifications_as_read(data=data)
        elif data['type'] == 'change_sender_name':
            await self.send_notifications_changed_to_websocket(data=data)
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
        if 'type' in data and 'sender' in data and 'receiver' in data:
            match data['type']:
                case 'canceled_friend_request_notification':
                    # transform into function to get and delete notification
                    notifications = await sync_to_async(Notification.objects.filter)(type='friend-request-pending',
                    sender=await get_user_id_by_username(data['sender']),
                    receiver=await get_user_id_by_username(data['receiver']))
                    async for notification in notifications:
                        await self.send_delete_notification_to_channel(notification, data)
                        await sync_to_async(notification.delete)()
                    
                case _:
                    return JsonResponse({"status": "error"}, status=200)
            return JsonResponse({"status": "success"}, status=200)
                # case 'canceled_game_request_notification':
                # case 'canceled_tournament_request_notification':
                
            
        
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

        for notification_type in notifications_types:
            if data['type'] == notification_type:
                notification = await sync_to_async(Notification.objects.create)(sender=request.user, receiver=self.receiver, type=notification_type)
                await self.send_new_notification_to_channel(notification)
                return JsonResponse({"status": "success"}, status=200)

        return JsonResponse({'status': 'error', 'message': 'unknown notification type'}, status=200)


    async def check_post_data(self, data):
        if not 'receiver' in data or not 'type' in data:
            return 'Missing attributes'
        if data['receiver'] is None or data['type'] is None:
            return 'some attributes are empty'
        try:
            self.receiver = await sync_to_async(User.objects.get)(username=data['receiver'])
        except User.DoesNotExist:
            return 'Sender user not found'
        return 'Success'


    def check_put_data(self, data):
        if not 'type' in data:
            return 'Type is missing'
        if data['type'] == 'set_as_read' and not 'uuids' in data:
            return 'Uuids is missing'
        elif data['type'] == 'change_sender_name' and not 'sender_id' in data:
            return 'Sender_id is missing'
        return 'Success'


    def check_delete_data(self, data):
        if not 'uuid' in data:
            return 'Notification uuid is missing'
        return 'Success'


    async def send_new_notification_to_channel(self, notification):
        channel_layer = get_channel_layer()
        user_id = await get_user_id_by_username(self.receiver)
        
        await channel_layer.group_send(
            f'notifications_user_{user_id}',
            {
                'type': 'new_notification',
                'notification': notification.to_dict()
            }
        )
        
    async def send_delete_notification_to_channel(self, notification, data):
        channel_layer = get_channel_layer()
        user_id = await get_user_id_by_username(data['receiver'])
        notification_dict = await sync_to_async(notification.to_dict)()
        
        await channel_layer.group_send(
            f'notifications_user_{user_id}',
            {
                'type': 'delete_notification', 
                'notification': notification_dict
            }
        )
        
        
    async def send_notifications_changed_to_websocket(self, data):
        channel_layer = get_channel_layer()
        username = await sync_to_async(User.objects.get)(id=data['sender_id'])
        notifications = await sync_to_async(list)(Notification.objects.filter(sender=username))

        for notification in notifications:
            notification_dict = await sync_to_async(notification.to_dict)()
            receiver_id = await get_user_id_by_username(notification_dict['receiver'])
            
            await channel_layer.group_send(
            f'notifications_user_{receiver_id}',
            {
                'type': 'change_notification_sender',
                'notification': notification.to_dict()
            }
        )