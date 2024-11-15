from django.utils.deprecation import MiddlewareMixin # assure the retro-compability for recent django middleware
from django.contrib.auth.models import AnonymousUser
from .utils.jwt_utils import get_user_from_jwt
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Notification
from datetime import timedelta
from django.http import JsonResponse
from django.conf import settings

# Middleware for jwt authentication
from .utils.user_utils import send_request
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
        print('---------------> JWT TEST START <----------------')
        token = request.COOKIES.get('jwt')
        print(f'-> test - token_jwt : {token} <-')
        if token:
            jwt_user = await get_user_from_jwt(token)
            if jwt_user == 'expired':
                print('-> token expired, send request for new token <-')
                await self.send_new_token_request(request=request, jwt_user=jwt_user)
            elif jwt_user == None:
                print('-> token is not valid, JWT_FAILED <-')
                request.jwt_failed = True
                request.user = AnonymousUser()
            else:
                print('-> valid token <-')
                request.user = jwt_user
        else:
            refresh_token = request.COOKIES.get('jwt_refresh')
            print(f'-> No session token, refresh_token : {refresh_token} <-')
            if refresh_token:
                jwt_user = await get_user_from_jwt(refresh_token)
                if jwt_user == 'expired' or jwt_user == None:
                    print('-> refresh token is not valid or expired, JWT_FAILED <-')
                    request.jwt_failed = True
                    request.user = AnonymousUser()
                else:
                    print('-> valid refresh token, send request for new token <-')
                    await self.send_new_token_request(request=request, jwt_user=jwt_user)
            else:
                    print('-> No refresh token, JWT_FAILED <-')
                    request.user = AnonymousUser()
        print('---------------> JWT TEST END <----------------')
        response = await self.get_response(request) 
        return response 

    async def send_new_token_request(self, request, jwt_user):
        try:
            request_response = await send_request(request_type='GET',request=request, url='http://auth:8000/api/auth/update-tokens/')
            print(f'-> request_response: {request_response} <-')
            if request_response and request_response.cookies:
                request.new_token = request_response.cookies.get('jwt')
                request.new_token_refresh =  request_response.cookies.get('jwt_refresh')
                jwt_user = await get_user_from_jwt(request.new_token)
                request.user = jwt_user
            else:
                request.user = AnonymousUser()
        except Exception as e:
            print(f'-> Error while requesting: {str(e)} <-')
            request.jwt_failed = True
            request.user = AnonymousUser() 
    
    async def process_response(self, request, response):  
        if hasattr(request, 'jwt_failed'):
            response = JsonResponse({'error': 'invalid session token'}, status=401)
            response.delete_cookie('jwt')
            response.delete_cookie('jwt_refresh')
        if hasattr(request, 'new_token'):
            response.set_cookie('jwt', request.new_token, httponly=True, max_age=settings.ACCESS_TOKEN_LIFETIME)
        if hasattr(request, 'new_token_refresh'):
            response.set_cookie('jwt_refresh', request.new_token_refresh, httponly=True, max_age=settings.REFRESH_TOKEN_LIFETIME)
        return response

 
class NotificationMiddleware(MiddlewareMixin):
    async def __call__(self, request):
        response = await self.process_request(request)
        return response


    async def process_request(self, request):
        if isinstance(request.user, AnonymousUser):
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
            await sync_to_async(notification.delete)()
