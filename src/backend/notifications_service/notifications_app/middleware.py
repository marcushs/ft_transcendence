from .utils.jwt_utils import get_user_from_jwt, Refresh_jwt_token
from django.utils.deprecation import MiddlewareMixin # assure the retro-compability for recent django middleware
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.conf import settings
from .models import Notification
from django.utils import timezone
from datetime import timedelta, datetime
from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from .utils.user_utils import get_user_id_by_username


User = get_user_model()

class JWTAuthMiddleware(MiddlewareMixin):
    async def __call__(self, request):
        response = await self.process_request(request)
        response = await self.process_response(request, response)
        return response

    async def process_request(self, request):
        token = request.COOKIES.get('jwt')
        if token:
            jwt_user = await get_user_from_jwt(token)
            if jwt_user:
                request.user = jwt_user
            else:
                request.jwt_failed = True
                request.user = AnonymousUser()
        else:
            refresh_token = request.COOKIES.get('jwt_refresh')
            if refresh_token:
                jwt_user = await get_user_from_jwt(refresh_token)
                if jwt_user:
                    token = Refresh_jwt_token(refresh_token, 'access')
                    request.new_jwt = token
                    token_refresh = Refresh_jwt_token(refresh_token, 'refresh')
                    request.new_jwt_refresh = token_refresh
                    request.user = jwt_user
                else:
                    request.jwt_failed = True
                    request.user = AnonymousUser()
            else:
                    request.user = AnonymousUser()
        response = await self.get_response(request)
        return response

    async def process_response(self, request, response):
        if hasattr(request, 'jwt_failed'):
            response = JsonResponse({'message': 'session has expired, please log in again'}, status=401)
            response.delete_cookie('jwt')
            response.delete_cookie('jwt_refresh')
        if hasattr(request, 'new_jwt'):
            response.set_cookie('jwt', request.new_jwt, httponly=True, max_age=settings.JWT_EXP_DELTA_SECONDS)
        if hasattr(request, 'new_jwt_refresh'):
            response.set_cookie('jwt_refresh', request.new_jwt_refresh, httponly=True, max_age=settings.JWT_REFRESH_EXP_DELTA_SECONDS)
        return response

 
class NotificationMiddleware(MiddlewareMixin):
    async def __call__(self, request):
        response = await self.process_request(request)
        return response


    async def process_request(self, request):
        if request.user.is_authenticated:
            await self.remove_duplicate_notifications(request)
            user_notifications = await sync_to_async(list)(Notification.objects.filter(receiver=request.user, is_read=True))
            for notification in user_notifications:
                if notification.type == 'friend-request-accepted' and notification.is_read_at and notification.is_read_at < timezone.now() - timedelta(minutes=1):  #replace by timedelta(days=????)
                    await sync_to_async(notification.delete)()
        response = await self.get_response(request)
        return response


    async def remove_duplicate_notifications(self, request):
        user_notifications = await sync_to_async(list)(Notification.objects.filter(receiver=request.user))
        senders = set(await sync_to_async(lambda: [notification.sender for notification in user_notifications])())
        for sender in senders:
            notifications_by_sender = Notification.objects.filter(sender=sender, receiver=request.user)
            await self.remove_duplicate_notifications_by_sender(request, notifications_by_sender)


    async def remove_duplicate_notifications_by_sender(self, request, notifications_by_sender):
        friend_request_accepted = await sync_to_async(list)(notifications_by_sender.filter(type='friend-request-accepted'))
        friend_request_pending = await sync_to_async(list)(notifications_by_sender.filter(type='friend-request-pending'))
        private_match_invitation = await sync_to_async(list)(notifications_by_sender.filter(type='private-match-invitation'))
        tournament_invitation = await sync_to_async(list)(notifications_by_sender.filter(type='tournament-invitation'))

        await self.delete_notifications(request, friend_request_accepted[:-1])
        await self.delete_notifications(request, friend_request_pending[:-1])
        await self.delete_notifications(request, private_match_invitation[:-1])
        await self.delete_notifications(request, tournament_invitation[:-1])

    async def delete_notifications(self, request, notifications_to_delete):
        for notification in notifications_to_delete:
#             await self.send_delete_notification_to_channel(request, notification)
            await sync_to_async(notification.delete)()

    # async def send_delete_notification_to_channel(self, request, notification):
    #     channel_layer = get_channel_layer()
    #     user_id = await get_user_id_by_username(request.user)
        
    #     await channel_layer.group_send(
    #         f'user_{user_id}',
    #         {
    #             'type': 'delete_notification',
    #             'notification': await sync_to_async(notification.to_dict)()
    #         }
    #     )