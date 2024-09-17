from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from ..models import FriendRequest
from ..models import FriendList, User
from asgiref.sync import sync_to_async
from django.views import View
import json

async def get_friend_request(sender, receiver):
    try:
        return await FriendRequest.objects.get(sender=sender, receiver=receiver, is_active=True)
    except FriendRequest.DoesNotExist:
        return False

class friendshipManager(View):
    def __init__(self):
        super()

    async def post(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'You are not logged in'}, status=401)
        if await self.init(request) is False:
            return JsonResponse({"message": 'Invalid request, missing some information'}, status=400)
        match self.status:
            case "accept":
                return await self.accept_friendship()
            case "add":
                return await self.send_friendship()
            case "cancel":
                return await self.cancel_friendship()
            case "decline":
                return await self.decline_friendship()
            case "remove":
                return await self.remove_friendship()
            case _:
                return JsonResponse({'message': 'Unknown friendship status request'}, status=400)
  
    async def init(self, request):
        data = json.loads(request.body.decode('utf-8'))
        if not all(key in data for key in ('status', 'target_username')):
            return False
        self.user = request.user
        self.status = data['status']
        try:
            self.target_user = await sync_to_async(User.objects.get)(username=data['target_username'])
            self.friend_list = await sync_to_async(FriendList.objects.get)(user=self.user)
        except User.DoesNotExist:
            return False
        except FriendList.DoesNotExist: 
            return False
        return True
 
    async def accept_friendship(self):
        friend_request = await sync_to_async(lambda: FriendRequest.objects.filter(sender=self.target_user, receiver=self.user, is_active=True).first())
        if not friend_request:
            return JsonResponse({'status': 'error', 'message': 'No active friend request found'}, status=200)
        await sync_to_async(friend_request.accept)()
        return JsonResponse({'status': 'success', 'friendship_status': 'mutual_friend', 'message': 'friends invitation successfully accepted'}, status=200)

    async def send_friendship(self):
        from_friend_request = await sync_to_async(lambda: FriendRequest.objects.filter(sender=self.target_user, receiver=self.user, is_active=True).first())
        to_friend_request = await sync_to_async(lambda: FriendRequest.objects.filter(sender=self.user, receiver=self.target_user, is_active=True).first())
        if from_friend_request or to_friend_request:
            return JsonResponse({'status': 'error', 'message': 'Friend request already sent'}, status=200)
        await sync_to_async(FriendRequest.objects.create)(sender=self.user, receiver=self.target_user)
        return JsonResponse({'status': 'success', 'friendship_status': 'pending_sent', 'message': 'friends invitation successfully send'}, status=200)

    async def cancel_friendship(self):
        friend_request = await sync_to_async(lambda: FriendRequest.objects.filter(sender=self.user, receiver=self.target_user, is_active=True).first())
        if not friend_request:
            return JsonResponse({'status': 'error', 'message': 'No active friend request found'}, status=200)
        await sync_to_async(friend_request.cancel)()
        return JsonResponse({'status': 'success', 'friendship_status': 'not_friend', 'message': 'friends invitation successfully canceled'}, status=200)

    async def decline_friendship(self):
        friend_request = await sync_to_async(lambda: FriendRequest.objects.filter(sender=self.target_user, receiver=self.user, is_active=True).first())
        if not friend_request:
            return JsonResponse({'status': 'error', 'message': 'No active friend request found'}, status=200)
        await sync_to_async(friend_request.cancel)()
        return JsonResponse({'status': 'success', 'friendship_status': 'not_friend', 'message': 'friends invitation successfully declined'}, status=200)

    async def remove_friendship(self):
        if self.friend_list.is_mutual_friend(friend=self.target_user) is False:
            return JsonResponse({'status': 'error', 'message': 'Cant remove this contact from friendlist, you\'re already not friend'}, status=200)
        await sync_to_async(self.friend_list.unfriend)(self.target_user)
        return JsonResponse({'status': 'success', 'friendship_status': 'not_friend', 'message': 'friends invitation successfully removed'}, status=200)