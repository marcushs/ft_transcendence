from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from ..models import FriendList, FriendRequest
from django.views import View

def get_friends_and_pending_id_list(user):
    user_friends_list = FriendList.objects.get(user=user)
    if not user_friends_list:
        raise Exception('Friend list not found')
    friends_list = list(user_friends_list.friends.all()) 
    received_requests = list(FriendRequest.objects.filter(receiver=user)) 
    sent_requests = list(FriendRequest.objects.filter(sender=user))
    friends_id = [friend.id for friend in friends_list]
    send_request_id = [request.receiver.id for request in sent_requests]
    receive_request_id = [request.sender.id for request in received_requests]
    return friends_id + send_request_id + receive_request_id  
    

class GetFriendsList(View): 
    def __init__(self):
        super()
         
    def get(self, request):
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'status': 'error', 'message': 'unregistered'}, status=200) 
            self.friend_list = self.get_friend_list(request.user)
            if not self.friend_list:
                return JsonResponse({'message': 'Friend list not found', 'status': 'error'}, status=404) 
            pending_requests = self.get_pending_requests(request.user)
            return JsonResponse({
                'status': 'success',
                'message': {
                    'friends': self.friend_list.to_dict(),
                    'received_requests': pending_requests['received'], 
                    'sent_requests': pending_requests['sent']
                    }
                }, status=200) 
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)

    def get_friend_list(self, user):
        return FriendList.objects.filter(user=user).first()

    def get_pending_requests(self, user):
        received_requests = FriendRequest.objects.filter(receiver=user)
        sent_requests = FriendRequest.objects.filter(sender=user)
        return {
            'received': [{'username': request.sender.username, 'id': request.sender.id} for request in received_requests],
            'sent': [{'username': request.receiver.username, 'id': request.receiver.id} for request in sent_requests],
            'count': received_requests.count() + sent_requests.count(),
        }