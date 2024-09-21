from .websocket_utils import notify_friend_display_change
from django.contrib.auth.models import AnonymousUser
from ..models import FriendList, User
from django.http import JsonResponse
from ..models import FriendRequest
from django.views import View
import json

def get_friend_request(sender, receiver):
    try:
        return FriendRequest.objects.get(sender=sender, receiver=receiver)
    except FriendRequest.DoesNotExist:
        return False

class friendshipManager(View):
    def __init__(self):
        super()

    def post(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'You are not logged in'}, status=401)
        if self.init(request) is False:
            return JsonResponse({"message": 'Invalid request, missing some information'}, status=400)
        match self.status:
            case "accept":
                return self.accept_friendship()
            case "add":
                return self.send_friendship()
            case "cancel":
                return self.cancel_friendship()
            case "decline":
                return self.decline_friendship()
            case "remove":
                return self.remove_friendship()
            case _:
                return JsonResponse({'message': 'Unknown friendship status request'}, status=400)
  
    def init(self, request):
        data = json.loads(request.body.decode('utf-8'))
        if not all(key in data for key in ('status', 'target_username')):
            return False
        self.user = request.user
        self.status = data['status']
        try:
            self.target_user = User.objects.get(username=data['target_username'])
            self.friend_list = FriendList.objects.get(user=self.user)
        except User.DoesNotExist:
            return False
        except FriendList.DoesNotExist: 
            return False
        return True
 
    def accept_friendship(self):
        friend_request = FriendRequest.objects.filter(sender=self.target_user, receiver=self.user).first()
        if not friend_request:
            return JsonResponse({'status': 'error', 'message': 'No active friend request found'}, status=200)
        friend_request.accept()
        notify_friend_display_change(created=False, action='accepted', receiver=self.target_user, sender=self.user)
        return JsonResponse({'status': 'success', 'friendship_status': 'mutual_friend', 'message': 'friends invitation successfully accepted'}, status=200)

    def send_friendship(self):
        from_friend_request = FriendRequest.objects.filter(sender=self.target_user, receiver=self.user).first()
        to_friend_request = FriendRequest.objects.filter(sender=self.user, receiver=self.target_user).first()
        if from_friend_request or to_friend_request:
            return JsonResponse({'status': 'error', 'message': 'Friend request already sent'}, status=200)
        FriendRequest.objects.create(sender=self.user, receiver=self.target_user)
        notify_friend_display_change(created=True, action='accepted', receiver=self.target_user, sender=self.user)
        return JsonResponse({'status': 'success', 'friendship_status': 'pending_sent', 'message': 'friends invitation successfully send'}, status=200)

    def cancel_friendship(self):
        friend_request = FriendRequest.objects.filter(sender=self.user, receiver=self.target_user).first()
        if not friend_request:
            return JsonResponse({'status': 'error', 'message': 'No active friend request found'}, status=200)
        friend_request.cancel()
        notify_friend_display_change(created=False, action='refused', receiver=self.target_user, sender=self.user)
        return JsonResponse({'status': 'success', 'friendship_status': 'not_friend', 'message': 'friends invitation successfully canceled'}, status=200)

    def decline_friendship(self):
        friend_request = FriendRequest.objects.filter(sender=self.target_user, receiver=self.user).first()
        if not friend_request:
            return JsonResponse({'status': 'error', 'message': 'No active friend request found'}, status=200)
        friend_request.cancel()
        notify_friend_display_change(created=False, action='refused', receiver=self.target_user, sender=self.user)
        return JsonResponse({'status': 'success', 'friendship_status': 'not_friend', 'message': 'friends invitation successfully declined'}, status=200)

    def remove_friendship(self):
        if self.friend_list.is_mutual_friend(friend=self.target_user) is False:
            return JsonResponse({'status': 'error', 'message': 'Cant remove this contact from friendlist, you\'re already not friend'}, status=200)
        self.friend_list.unfriend(self.target_user)
        notify_friend_display_change(created=False, action='refused', receiver=self.target_user, sender=self.user)
        return JsonResponse({'status': 'success', 'friendship_status': 'not_friend', 'message': 'friends invitation successfully removed'}, status=200)