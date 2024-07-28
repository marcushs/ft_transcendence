from django.http import JsonResponse
from .utils.csrf_utils import generate_csrf_token
from django.contrib.auth.models import AnonymousUser
from django.db.models import Q
from .models import User
from django.views import View
import json
# from .models import FriendRequest
# from enum import Enum

def index(request):
    csrf_token = request.COOKIES.get('csrftoken')
    if not csrf_token:
        csrf_token = generate_csrf_token(request)
        response = JsonResponse({"message": 'new csrf token generated'})
        response.set_cookie('csrftoken', csrf_token, httponly=False, max_age=3600)
    else:
        response = JsonResponse({"message": 'csrf token already generated'})
    return response
 
def get_information_view(request):
    if isinstance(request.user, AnonymousUser):
        return JsonResponse({'message': 'you are not logged in'}, status=401)
    return JsonResponse({'user': request.user.to_dict()}, status=200)

class searchUsers(View):
    def __init__(self):
        super().__init__
        
    def get(self, request):
        search_input = request.GET.get('q', None)
        if search_input is None:
            return JsonResponse({'message': 'No input provided'}, status=400)
        users = User.objects.filter(Q(username__icontains=search_input)) # Filter users who username contains the search input
        if users.exists(): # Create a list of users in dictionary format
            users_list = [{
                'user': user.username,
                'profile_image': user.profile_image.url if user.profile_image else None,
                'profile_image_link': user.profile_image_link
                }
                for user in users
            ]
            return JsonResponse(users_list, safe=False, status=200)
        else:
            return JsonResponse({'message': 'No users found'}, status=400)

# class FriendRequestStatus(Enum):
#     NO_REQUEST_SENT = -1
#     THEM_SENT_TO_YOU = 0
#     YOU_SENT_TO_THEM = 1
    
# def get_friend_request(sender, receiver):
#     try:
#         return FriendRequest.objects.get(sender=sender, receiver=receiver, is_active=True)
#     except FriendRequest.DoesNotExist:
#         return False