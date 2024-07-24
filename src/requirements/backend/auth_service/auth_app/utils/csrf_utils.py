# from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from django.http import JsonResponse


# @csrf_exempt
def generate_csrf_token(request):
    if request.COOKIES.get('csrftoken') is None:
        csrf_token = get_token(request)
        response = JsonResponse({'message': 'new csrfToken generated'}, status=200)
        response.set_cookie('csrftoken', csrf_token, httponly=False, max_age=3600)
    else:
        response = JsonResponse({'message': 'csrfToken already generated'}, status=201)
    return response