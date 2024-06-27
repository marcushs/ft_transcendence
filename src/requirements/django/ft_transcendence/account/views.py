from django.http import JsonResponse
from .auth.csrf_utils import generate_csrf_token
from django.views.decorators.csrf import csrf_exempt
from django.forms.models import model_to_dict
from django.contrib.auth import get_user_model
from .auth.decorator import check_jwt

User = get_user_model()

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
@check_jwt
def protectedView(request):
    if request.user.is_authenticated:
        # user_data = request.user.to_dict()
        # user_data['is_verified'] = request.user.is_verified()
        user = model_to_dict(request.jwt_user)
        return JsonResponse({'message': 'protected view ok', 'user': user}, status=201)
    else:
        return JsonResponse({'error': 'User not found'}, status=404)
