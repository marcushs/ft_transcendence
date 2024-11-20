# --- SRC --- #
from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.views import View
from ..models import User

class IsLoggedWithGoogle(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        try:
            user = request.user
            if isinstance(user, AnonymousUser):
                return JsonResponse({'message': 'You are not logged in', 'status': 'Error'}, status=400)
            if User.objects.filter(id=user.id).exists():
                return JsonResponse({'message': 'logged with google', 'status': 'Success'}, status=200)
            return JsonResponse({'message': 'Not logged with google', 'status': 'Error'}, status=200)
        except Exception as e:
            print(f'Error: {str(e)}')
            return JsonResponse({"message": str(e)}, status=400)