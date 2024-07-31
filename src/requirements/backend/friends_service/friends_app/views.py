from typing import Any
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from .utils.friends_utils import fr
from django.views import View
from enum import Enum

class FriendRequestStatus(Enum):
    NO_REQUEST_SENT = -1
    THEM_SENT_TO_YOU = 0
    YOU_SENT_TO_THEM = 1
    

class GetFriendShipStatus(View):
    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        
    def get(self, request):
        is_self = True
        is_friend = False
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'status': 'error', 'message': 'User not found'}, status=400)
        target_user = request.GET.get('q', '')
        if target_user != request.user:
            is_self = False
            
    def get_friend_list(target_user):
        try:
            friend_list =  friends_utils.
        except:
            pass
        