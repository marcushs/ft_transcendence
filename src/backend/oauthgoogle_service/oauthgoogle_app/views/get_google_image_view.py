# --- SRC --- #
from django.views import View
from django.http import JsonResponse
from ..models import User
from django.contrib.auth import get_user_model

User = get_user_model()

class getGoogleImageView(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        user_id = request.GET.get('user_id')
        if user_id is None:
            return JsonResponse({'message': 'No user id provided', 'status': 'Error'}, status=400)
        if User.objects.filter(id=str(user_id)).exists():
            user = User.objects.get(id=str(user_id))
            pp_link = user.profile_image_link
            return JsonResponse({'message': {'profile_picture': pp_link}, 'status': 'Success'}, status=200)
        return JsonResponse({'message': 'User not found', 'status': 'Error'}, status=404)
            
        
