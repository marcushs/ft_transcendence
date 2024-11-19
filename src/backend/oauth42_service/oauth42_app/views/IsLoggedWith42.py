# --- SRC --- #
from django.http import JsonResponse
from django.views import View
from ..models import User


class IsLoggedWith42(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        user_id = request.GET.get('user_id', None)
        if user_id is None:
            return JsonResponse({'message': 'MissingUrlData'}, status=400)
        if User.objects.filter(id=user_id).exists():
            return JsonResponse({'message': 'logged with 42', 'status': 'Success'}, status=200)
        return JsonResponse({'message': 'Not logged with 42', 'status': 'Error'}, status=200)
            
        
