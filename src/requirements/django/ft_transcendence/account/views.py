import json
from urllib import response

from django.http import JsonResponse
from .auth.csrf_utils import generate_csrf_token
from django.views.decorators.csrf import csrf_exempt
from django.forms.models import model_to_dict
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from .auth.decorator import check_jwt
import re

# User = get_user_model()

@csrf_exempt
def generateCsrfToken(request):
        csrf_token = generate_csrf_token(request)
        response = JsonResponse({'message': 'new csrfToken generated'}, status=201)
        response.set_cookie('csrftoken', csrf_token, httponly=False, max_age=3600)
        return response


def index(request):
    csrf_token = request.COOKIES.get('csrftoken')
    if not csrf_token:
        csrf_token = generate_csrf_token(request)
        response = JsonResponse({"message": 'new csrf token generated'})
        response.set_cookie('csrftoken', csrf_token, httponly=False, max_age=3600)
    else:
        response = JsonResponse({"message": 'csrf token already generated'})
    return response

# test view for jwt token
# @check_jwt
def protectedView(request):
    if isinstance(request.user, AnonymousUser):
        return JsonResponse({'error': 'User not found'}, status=201)
    return JsonResponse({'message': 'protected view ok', 'user': request.user.to_dict()}, status=201)


def change_username_view(request):
    User = get_user_model()

    if isinstance(request.user, AnonymousUser):
        return JsonResponse({'error': 'User not found'}, status=201)

    if request.method == 'POST':
        current_user = request.user
        # data = json.loads(request.body)
        response = {}

        response.update(change_username(User, current_user, request))
        response.update(change_email(User, current_user, request))
        response.update(change_profile_image(current_user, request))

        return JsonResponse(response, status=201)
    return JsonResponse({'error': 'User not found'}, status=400)



def change_username(User, current_user, request):
    new_username = request.POST.get('username')
    response = {}

    print(new_username)
    if new_username == current_user.username:
        response['username_conflict'] = 'Username is the same'
        return response

    if User.objects.filter(username=new_username).exists():
        response['username_error'] = f'{new_username} : this username already exists'
        return response

    if len(new_username) > 12:
        response['username_error'] = 'Username must be less than 12 characters'
        return response

    response['username_message'] = 'Username has been successfully changed'
    current_user.username = new_username
    current_user.save()
    return response

def change_email(User, current_user, request):
    new_email = request.POST.get('email')
    response = {}

    if new_email == current_user.email:
        response['email_conflict'] = 'Email is the same'
        return response

    if User.objects.filter(email=new_email).exists():
        response['email_error'] = f'{new_email}: This email already has an account'
        return response

    if re.search(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", new_email) is None:
        response['email_error'] = 'Invalid email address'
        return response

    response['email_message'] = 'Email has been successfully changed'
    current_user.email = new_email
    current_user.save()
    return response


def change_profile_image(current_user, request):
    # new_image = request['image']
    new_image = request.FILES.get('profile_image')
    response = {}

    if new_image == current_user.profile_image:
        response['image_conflict'] = 'Profile image is the same'

    response['image_message'] = 'Profile image has been successfully changed'
    current_user.profile_image = new_image
    current_user.save()
    return response