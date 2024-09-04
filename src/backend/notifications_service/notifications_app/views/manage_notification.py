from django.http import JsonResponse
from ..models import Notification
from django.contrib.auth.models import User
from django.views import View
from django.contrib.auth.models import AnonymousUser
import json


class manage_notification_view(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'status':'error', 'message': 'No connected user'}, status=200)
        own_notifications = Notification.objects.filter(receiver=request.user)
        notifications_dict = self.get_notification_dict(notifications=own_notifications)
        return JsonResponse({"status": "success", 'message': json.dumps(notifications_dict)}, status=200)
    
    def get_notification_dict(self, notifications):
        notifications_dict = {}
        for notification in notifications:
            notifications_dict.append(notification.to_dict())
        return notifications_dict
    
    def put(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'status':'error', 'message': 'No connected user'}, status=200)
        data = json.loads(request.body.decode('utf-8'))
        check_response = self.check_post_data(data=data)
        if check_response != 'Success':
            return JsonResponse({'status': 'error', 'message': check_response}, status=200)
        self.set_notifications_as_read(data=data)
        return JsonResponse({"status": "success"}, status=200)

    def set_notifications_as_read(self, data):
        for notification_id in data['uuid']:
            try:
                notification = Notification.objects.get(uuid=notification_id)
                notification.is_read = True
                notification.save()
            except User.DoesNotExist:
                pass
            
    
    def delete(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'status':'error', 'message': 'No connected user'}, status=200)
        data = json.loads(request.body.decode('utf-8'))
        check_response = self.check_delete_data(data=data)
        if check_response != 'Success':
            return JsonResponse({'status': 'error', 'message': check_response}, status=200)
        try:
            notification = Notification.objects.get(uuid=data['uuid'])
            notification.delete()
        except User.DoesNotExist:
            pass
        return JsonResponse({"status": "success"}, status=200)


    def post(self, request):
        print('------------------------------------- TEST ---------------------------------')

        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'status':'error', 'message': 'No connected user'}, status=200)
        data = json.loads(request.body.decode('utf-8'))
        check_response = self.check_post_data(data=data)
        if check_response != 'Success':
            return JsonResponse({'status': 'error', 'message': check_response}, status=200)
        match data['type']:
            case 'new_contact':
                message = f'{request.user.username} as accepted your invitation'
                Notification.objects.create(sender=request.user, receiver=self.receiver, type=data['type'], message=message)
            case 'contact_request':
                message = f'{request.user.username} sent you a contact request'
                Notification.objects.create(sender=request.user, receiver=self.receiver, type=data['type'], message=message)
            case 'game_invitation':
                message = f'{request.user.username} invited you to play'
                Notification.objects.create(sender=request.user, receiver=self.receiver, type=data['type'], message=message)
            case 'message_received':
                message = f'{request.user.username} sent you a new message'
                Notification.objects.create(sender=request.user, receiver=self.receiver, type=data['type'], message=message)
            case _:
                return JsonResponse({'status': 'error', 'message': 'unknown notification type'}, status=200)
        return JsonResponse({"status": "success"}, status=200)

    def check_post_data(self, data):
        if not hasattr(data, 'receiver') or not hasattr(data, 'type'):
            return {'Missing attributes'}
        if data['sender'] is None or data['receiver'] is None or data['type'] is None:
            return {'some attributes are empty'}
        try:
            self.receiver = User.objects.get(username=data['receiver'])
        except User.DoesNotExist:
            return {'Sender user not found'}
        return {'Success'}
    
    def check_put_data(self, data):
        if not data['uuid_list']:
            return {'Missing attributes'}
        if data['uuid_list'] is None:
            return {'Notification id is missing'}
        try:
            self.sender = User.objects.get(username=data['sender'])
        except User.DoesNotExist:
            return {'Sender user not found'}
        return {'Success'}
    
    def check_delete_data(self, data):
        if not data['uuid']:
            return {'Missing attributes'}
        if data['uuid'] is None:
            return {'Notification id  is missing'}
        try:
            self.sender = User.objects.get(username=data['sender'])
        except User.DoesNotExist:
            return {'Sender user not found'}
        return {'Success'}
