from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from ..models import FriendRequest
from ..models import FriendList
from django.views import View
import json

def get_friend_request(sender, receiver):
    try:
        return FriendRequest.objects.get(sender=sender, receiver=receiver, is_active=True)
    except FriendRequest.DoesNotExist:
        return False

class friendshipManager(View):
    def __init__(self):
        super()
        
    def post(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'You are not logged in'}, status=400)
        data = json.loads(request.body.decode('utf-8'))
        if 'status' in data:
            status = data['status']
        else:
            status = 'unknown'
        match status:
            case "accept":
                self.accept_friendship(request)
            case "send":
                self.send_friendship(request)
            case "cancel":
                self.cancel_friendship(request)
            case "decline":
                self.decline_friendship(request)
            case "remove":
                self.remove_friendship(request)
            case _:
                return JsonResponse({'message': 'Unknown friendship status'}, status=400)

    def accept_friendship(request):
        pass

    def send_friendship(request):
        pass

    def cancel_friendship(request):
        pass

    def decline_friendship(request):
        pass

    def remove_friendship(request):
        pass