from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from .jwt_utils import createJwtToken, check_jwt
from django.conf import settings
import json

def index(request):
    print(request.method)
    data = "asdfaddfadfasdfasdfasdfasdfasdfsdfsfsfasfasdfsd"
    return JsonResponse({"message": data})

@check_jwt
@csrf_exempt
def welcome(request):
    if request.user is not None and request.user.is_authenticated:
        return JsonResponse({'is_logged_in': True, 'username': request.user.username})
    else:
        return JsonResponse({'is_logged_in': False}, status=401)

@ensure_csrf_cookie
@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        username = data['username']
        password = data['password']

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            token = createJwtToken(user, 'access')
            # refresh_token = create_jwt_token(user, 'refresh')
            response = JsonResponse({'message': 'Login successfully'}, status=201)
            response.set_cookie('jwt', token, httponly=True, max_age=settings.JWT_EXP_DELTA_SECONDS)
            # response.set_cookie('jwt_refresh', refresh_token, httponly=True, max_age=settings.JWP_EXP_DELTA_SECONDS)
            return response
        else:
            return JsonResponse({'message': 'Invalid credentials', 
                                 'redirect_url': 'login', 
                                 'username': username, 
                                 'password': password}, status=400)
    return JsonResponse({"message": data})

@csrf_exempt
def signup(request):
   if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        username = data['username']
        email = data['email']
        password = data['password']
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(username=username, email=email, password=password)
            return JsonResponse({'message': 'User created successfully', 'redirect_url': 'login'}, status=201)
        return JsonResponse({'message': 'Username already exists', 'redirect_url': 'signup'}, status=400)
   return JsonResponse({'message': 'Invalid request method'}, status=405)
 
# Create your views here.
  
  