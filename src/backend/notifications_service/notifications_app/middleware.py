from django.utils.deprecation import MiddlewareMixin # assure the retro-compability for recent django middleware
from django.contrib.auth.models import AnonymousUser
from .utils.jwt_utils import get_user_from_jwt
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Notification
from datetime import timedelta
from django.http import JsonResponse
from django.conf import settings
 
User = get_user_model()
# Middleware for jwt authentication
class JWTAuthMiddleware(MiddlewareMixin):
    def process_request(self, request):
        token = request.COOKIES.get('jwt')
        if token:
            jwt_user = get_user_from_jwt(token)
            if jwt_user == 'expired':
                # call endpoint auth here to get new token from refresh_token
                pass
            elif jwt_user == None:
                request.jwt_failed = True
                request.user = AnonymousUser()
                return JsonResponse({"message": 'les problemes'}, status=400)
            else:
                request.user = jwt_user
        else:
            refresh_token = request.COOKIES.get('jwt_refresh')
            if refresh_token:
                jwt_user = get_user_from_jwt(refresh_token)
                if jwt_user == 'expired' or jwt_user == None:
                    request.jwt_failed = True
                    request.user = AnonymousUser()
                    pass
                else:
                    # call endpoint auth here to get new token from refresh_token
                    pass
            else:
                    request.user = AnonymousUser()
        response = self.get_response(request)
        return response
 
class NotificationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        self.remove_duplicate_notifications(request)
        try:
            user_notifications = list(Notification.objects.filter(receiver=request.user, is_read=True))
            for notification in user_notifications:  
                if notification.type == 'friend-request-accepted' and notification.is_read_at and notification.is_read_at < timezone.now() - timedelta(minutes=1):  #replace by timedelta(days=????)
                    notification.delete()
        except Exception as e:
            pass
        response = self.get_response(request)
        return response
    
    
    def remove_duplicate_notifications(self, request):
        try:
            user_notifications = Notification.objects.filter(receiver=request.user)
            senders = set(user_notification.sender for user_notification in user_notifications)
            for sender in senders:
                notifications_by_sender = user_notifications.filter(sender=sender)
                self.remove_duplicate_notifications_by_sender(notifications_by_sender)         
        except Exception as e: 
            pass
        
        
    def remove_duplicate_notifications_by_sender(self, notifications_by_sender):
        friend_request_accepted = list(notifications_by_sender.filter(type='friend-request-accepted'))
        friend_request_pending = list(notifications_by_sender.filter(type='friend-request-pending'))
        private_match_invitation = list(notifications_by_sender.filter(type='private-match-invitation'))
        tournament_invitation = list(notifications_by_sender.filter(type='tournament-invitation'))
        
        self.delete_notifications(friend_request_accepted[:-1])
        self.delete_notifications(friend_request_pending[:-1])
        self.delete_notifications(private_match_invitation[:-1])
        self.delete_notifications(tournament_invitation[:-1])
        
    
    def delete_notifications(self, notifications_to_delete):
        for notification in notifications_to_delete:
            notification.delete()