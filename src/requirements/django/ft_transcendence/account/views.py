# --- SRC --- #
from django.http import JsonResponse
# --- JWT --- #
from .auth.csrf_utils import generate_csrf_token
# --- UTILS --- #
from django.views.decorators.csrf import csrf_exempt


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
    if request.user.is_authenticated:
        return JsonResponse({'message': 'protected view ok', 'user': request.user.username}, status=201)
    else:
        return JsonResponse({'error': 'User not found'}, status=404)