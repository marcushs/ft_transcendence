from typing import Any
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.views import View
from .models import FriendList, FriendRequest
from enum import Enum
import json

class FriendRequestStatus(Enum):
    NO_REQUEST_SENT = -1
    THEM_SENT_TO_YOU = 0
    YOU_SENT_TO_THEM = 1
    

class GetFriendShipStatus(View):
    def __init__(self):
        super()
        
    def get(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'You are not logged in'}, status=400)
        self.init(request=request)
        response = self.check_data(user=request.user)
        if response['status'] != 200:
            return JsonResponse({'message': response['message']}, status=response['status'])
        return self.get_friend_request_status(user=request.user)
        
    def  init(self, request):
        self.is_self = True
        self.User = get_user_model()
        self.target_username = request.GET.get('q', '')
        self.friend_list = FriendList.objects.filter(user=request.user).first()
    
    def check_data(self, user):
        if not self.friend_list:
            return {'status': 404, 'message': 'Friend list not found'}
        if not self.target_username:
            return {'status': 400, 'message': 'No target user provided'}
        try:
            target_user = self.User.objects.get(username=self.target_username)
        except self.User.DoesNotExist:
            return {'status': 404, 'message': 'Target user does not exist'}
        if user != target_user:
            self.is_self = False
        return {'status': 200}

    def get_friend_request_status(self, user):
        if self.is_self == True:
            return JsonResponse({'status': 'self'}, status=200)
        if self.friend_list.is_mutual_friend(friend=self.target_username):
            return JsonResponse({'status': 'friend'}, status=200)
        try:
            FriendRequest.objects.get(sender=user, receiver=self.target_username, is_active=True):
            return JsonResponse({'status': 'pending', 'sender': 'you'}, status=200)
        except FriendRequest.DoesNotExist:
            pass
        try:
            if FriendRequest.objects.get(sender=self.target_username, receiver=user, is_active=True):
                return JsonResponse({'status': 'pending', 'sender': 'target'}, status=200)
        except FriendRequest.DoesNotExist:
            pass
        return JsonResponse({'status': 'unknown'}, status=200)