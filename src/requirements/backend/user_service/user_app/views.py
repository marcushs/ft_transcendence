from django.http import JsonResponse
from .utils.csrf_utils import generate_csrf_token
from django.contrib.auth.models import AnonymousUser
from django.views import View
from .models import User
import json


class add_new_user(View):
    def __init__(self):
        super().__init__
    
    def get(self, request):
        return JsonResponse({"message": 'get request successfully reached'}, status=200)
    

    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        if not all(key in data for key in ('email', 'username', 'user_id')):
            return JsonResponse({"message": 'Invalid request, missing some information'}, status=400)
        User.objects.create_user(email=data['email'], username=data['username'], user_id=data['user_id'])
        return JsonResponse({"message": 'user added with success'}, status=200)
        

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
