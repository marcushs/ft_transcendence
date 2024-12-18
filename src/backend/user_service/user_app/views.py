from django.http import JsonResponse
from .utils.csrf_utils import generate_csrf_token
from django.contrib.auth.models import AnonymousUser
from django.views import View


def index(request):
    csrf_token = request.COOKIES.get('csrftoken')
    if not csrf_token:
        csrf_token = generate_csrf_token(request)
        response = JsonResponse({"message": 'new csrf token generated'})
        response.set_cookie('csrftoken', csrf_token, httponly=False, max_age=3600)
    else:
        response = JsonResponse({"message": 'csrf token already generated'})
    return response
 
class get_information_view(View):
    def __init__(self):
        super().__init__   

    async def get(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'status':'error', 'message': 'not logged'}, status=200)
        return JsonResponse({'status':'success', 'user': request.user.to_dict()}, status=200)
