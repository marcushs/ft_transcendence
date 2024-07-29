from django.http import JsonResponse
from .utils.csrf_utils import generate_csrf_token
from django.contrib.auth.models import AnonymousUser
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

# class FriendRequestStatus(Enum):
#     NO_REQUEST_SENT = -1
#     THEM_SENT_TO_YOU = 0
#     YOU_SENT_TO_THEM = 1
    
# def get_friend_request(sender, receiver):
#     try:
#         return FriendRequest.objects.get(sender=sender, receiver=receiver, is_active=True)
#     except FriendRequest.DoesNotExist:
#         return False