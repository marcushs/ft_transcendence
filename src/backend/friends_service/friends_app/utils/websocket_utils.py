from django.contrib.auth.models import AnonymousUser
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.http import JsonResponse
from django.views import View
from ..views.get_friends_list import get_friends_and_pending_id_list
import json


class handle_friend_info_change(View):
    def __init__(self):
        super()
        
    def get(self, request):
        return JsonResponse({'message': 'http method not authorized', 'status': 'error'}, status=400)
    
    def post(self, request):
        print('--------------------------TEST--------------------------')
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'status': 'error', 'message': 'unregistered'}, status=200)  
        try:
            contacts_id_list = get_friends_and_pending_id_list(request.user)
        except Exception as e:
            return JsonResponse({'message': str(e), 'status': 'error'}, status=200) 
        data = json.loads(request.body.decode('utf-8'))
        for user_id in contacts_id_list:
            channel_layer = get_channel_layer()
            print(f'user_{user_id}') 
            async_to_sync(channel_layer.group_send)(
                f'user_{user_id}',
                {
                    'type': 'contact_info_update',
                    'event': 'contact_update',
                    'contact': json.dumps(data),
                }
            )
        print(f'contacts_list: \'{contacts_id_list}\' -- data: \'{data}\'')
        print('--------------------------------------------------------') 
        return JsonResponse({'status': 'success', 'message': 'contacts info successfully changed'}, status=200)
        
        


def notify_friend_display_change(created, action, is_contact, receiver=None, sender=None):
    if not is_contact:
        if action == 'accepted':
            if created:
                send_type = 'new contact request'
            else :
                send_type = 'new contact'
        else :
            send_type = 'deleted contact request'
    else:
        send_type = 'deleted contact' 
    
    if receiver:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'user_{receiver.id}',
            {
                'type': 'friend_update',
                'event': send_type,
                'message': f'Friend request updated for {sender.username}',
                'contact': sender.username,
                'is_sender': False,
            }
        )
        
    if sender:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'user_{sender.id}',
            {
                'type': 'friend_update',
                'event': send_type,
                'message': f'Friend request updated for {receiver.username}',
                'contact': receiver.username,
                'is_sender': True,
            }
        )