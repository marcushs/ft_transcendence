from ..utils.friends_utils import get_friend_request
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from ..models import FriendList
from django.views import View

class GetFriendShipStatus(View):
    def __init__(self):
        super()
        
    def get(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'status': 'error', 'message': 'unregistered'}, status=200)
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
            return {'status': 400, 'message': 'No target username provided'}
        try:
            self.target_user = self.User.objects.get(username=self.target_username)
        except self.User.DoesNotExist:
            return {'status': 404, 'message': 'Target user does not exist'}
        if user != self.target_user:
            self.is_self = False
        return {'status': 200}
 
    def get_friend_request_status(self, user):
        if self.is_self == True:
            return JsonResponse({'status': 'own_profile'}, status=200)
        if self.friend_list.is_mutual_friend(friend=self.target_user):
            return JsonResponse({'status': 'mutual_friend'}, status=200)
        if get_friend_request(sender=user, receiver=self.target_user) is not False:
            return JsonResponse({'status': 'pending_sent'}, status=200)
        if get_friend_request(sender=self.target_user, receiver=user) is not False:
            return JsonResponse({'status': 'pending_received'}, status=200)
        return JsonResponse({'status': 'not_friend'}, status=200)