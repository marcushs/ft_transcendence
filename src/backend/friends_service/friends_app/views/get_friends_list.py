from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from ..models import FriendList, FriendRequest
from django.views import View

class GetFriendsList(View):
    def __init__(self):
        super()
        
    def get(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'status': 'error', 'message': 'unregistered'}, status=200)
        self.friend_list = FriendList.objects.filter(user=request.user).first()
        if not self.friend_list:
            return JsonResponse({'message': 'Friend list not found', 'status': 404})
        pending_requests = self.get_pending_requests(request.user)
        return JsonResponse({
            'status': 'success',
            'message': {
                'friends': self.friend_list.to_dict(),
                'friends_count': self.friend_list.friends.count(),
                'received_requests': pending_requests['received'],
                'sent_requests': pending_requests['sent'],
                'requests_count': pending_requests['count']}
            }, status=200)
 
    def get_pending_requests(self, user):
        received_requests = FriendRequest.objects.filter(receiver=user, is_active=True)
        sent_requests = FriendRequest.objects.filter(sender=user, is_active=True)
        return {
            'received': [{'username': request.sender.username} for request in received_requests],
            'sent': [{'username': request.receiver.username} for request in sent_requests],
            'count': received_requests.count() + sent_requests.count(),
        }