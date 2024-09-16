from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from ..models import FriendList, FriendRequest
from asgiref.sync import sync_to_async
from django.views import View

class GetFriendsList(View):
    def __init__(self):
        super()
        
    async def get(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'status': 'error', 'message': 'unregistered'}, status=200)
        self.friend_list = await sync_to_async(FriendList.objects.filter)(user=request.user).first()
        if not self.friend_list:
            return JsonResponse({'message': 'Friend list not found', 'status': 404})
        pending_requests = await self.get_pending_requests(request.user)
        return JsonResponse({
            'status': 'success',
            'message': {
                'friends': self.friend_list.to_dict(),
                'received_requests': pending_requests['received'], 
                'sent_requests': pending_requests['sent']
                }
            }, status=200)
 
    async def get_pending_requests(self, user):
        received_requests = await sync_to_async(FriendRequest.objects.filter)(receiver=user, is_active=True)
        sent_requests = await sync_to_async(FriendRequest.objects.filter)(sender=user, is_active=True)
        return {
            'received': [{'username': request.sender.username} for request in received_requests],
            'sent': [{'username': request.receiver.username} for request in sent_requests],
            'count': received_requests.count() + sent_requests.count(),
        } 