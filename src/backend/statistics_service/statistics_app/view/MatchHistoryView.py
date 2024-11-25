from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.http import JsonResponse 
from django.views import View

User = get_user_model()

class MatchHistoryView(View):
    def __init__(self):
        super()


    def get(self, request):
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'No connected user'}, status=401)
            history = list(User.match_history(request.user).values())
            return JsonResponse(history[:5], safe=False, status=200)
        except Exception as e:
            print(f'Error: {str(e)}')
            return JsonResponse({"message": str(e)}, status=500)