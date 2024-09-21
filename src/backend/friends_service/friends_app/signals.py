from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import FriendList, FriendRequest, User


@receiver(post_save, sender=FriendRequest)
async def notify_friend_display_change(sender, instance, created, **kwargs):
    user = kwargs.get('user')
    action = kwargs.get('action')
    
    if action == 'accepted':
        if created:
            send_type = 'new contact request'
        else:
            send_type = 'new contact'
    else:
        send_type = 'deleted contact request'

    if user:
        channel_layer = get_channel_layer()
        user = await sync_to_async(channel_layer.group_send)(
            f'user_{user.id}',
            {
                'type': 'friend_update',
                'event': send_type,
                'message': f'Friend request updated for {user.username}',
                'user': user
            }
        )
        

@receiver(post_save, sender=FriendList)
async def notify_friend_display_change(sender, instance, created, **kwargs):
    user = kwargs.get('user')
    
    if user:
        channel_layer = get_channel_layer()
        user = await sync_to_async(channel_layer.group_send)(
            f'user_{user.id}',
            {
                'type': 'friend_update',
                'event': 'deleted contact',
                'message': f'Friend list updated for {user.username}',
                'user': user
            }
        )