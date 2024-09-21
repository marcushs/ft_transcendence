from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync



def notify_friend_display_change(created, action, receiver=None, sender=None):
    if action == 'accepted':
        if created:
            send_type = 'new contact request'
        else:
            send_type = 'new contact'
    else:
        send_type = 'deleted contact'

    print('--------------------------------------')
    print('target_user: ', receiver.id, ' : ', receiver.username)
    print('user: ', sender.id, ' : ', sender.username)
    
    if receiver:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'user_{receiver.id}',
            {
                'type': 'friend_update',
                'event': send_type,
                'message': f'Friend request updated for {sender.username}',
                'contact': sender.username,
                'is_sender': False
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
                'is_sender': True
            }
        )