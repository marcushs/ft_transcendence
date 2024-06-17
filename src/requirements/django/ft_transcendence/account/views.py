from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
import json

def index(request):
    print(request.method)
    data = "asdfaddfadfasdfasdfasdfasdfasdfsdfsfsfasfasdfsd"
    return JsonResponse({"message": data})

@login_required
def welcome(request):
    if request.user.is_authenticated:
        return JsonResponse({'is_logged_in': True, 'username': request.user.username})
    else:
        return JsonResponse({'is_logged_in': False})

@csrf_exempt
@ensure_csrf_cookie
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        username = data['username']
        password = data['password']

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'message': 'Login successful', 'redirect_url': 'profile', 'authenticated': user.is_authenticated}, status=200)
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
  
 