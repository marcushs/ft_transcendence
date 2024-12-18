# --- SRC --- #
from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.views import View
from ..models import User

class IsLoggedWithGithub(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        try:
            user_id = request.GET.get('user_id', None)
            if user_id is None:
                return JsonResponse({'message': 'MissingUrlData'}, status=400)
            if User.objects.filter(id=str(user_id)).exists():
                return JsonResponse({'message': 'logged with github', 'status': 'Success'}, status=200)
            return JsonResponse({'message': 'Not logged with github', 'status': 'Error'}, status=200)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)

