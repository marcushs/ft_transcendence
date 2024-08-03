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
        status = 'unknown'
        if 'status' in data:
            status = data['status']
        match status:
            case "accept":
                return self.accept_friendship(request)
            case "add":
                return self.send_friendship(request)
            case "cancel":
                return self.cancel_friendship(request)
            case "decline":
                return self.decline_friendship(request)
            case "remove":
                return self.remove_friendship(request)
            case _:
                return JsonResponse({'message': 'Unknown friendship status request'}, status=400)
 
    def accept_friendship(self, request):
        return JsonResponse({'status': 'success', 'message': 'accept_method reached'}, status=200)

    def send_friendship(self, request):
        return JsonResponse({'status': 'success', 'message': 'send_method reached'}, status=200)

    def cancel_friendship(self, request):
        return JsonResponse({'status': 'success', 'message': 'cancel_method reached'}, status=200)

    def decline_friendship(self, request):
        return JsonResponse({'status': 'success', 'message': 'decline_method reached'}, status=200)

    def remove_friendship(self, request):
        return JsonResponse({'status': 'success', 'message': 'remove_method reached'}, status=200)