from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
import json

def index(request):
    print(request.method)
    data = "asdfaddfadfasdfasdfasdfasdfasdfsdfsfsfasfasdfsd"
    return JsonResponse({"message": data})

def login(request):
    print(request.method)
    data = "Send from login"
    return JsonResponse({"message": data})

@csrf_exempt
def signup(request):
   if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        username = data['user_name']
        email = data['email']
        password = data['password']
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(username=username, email=email, password=password)
            return JsonResponse({'message': 'User created successfully'}, status=201)
        return JsonResponse({'message': 'Username already exists'}, status=400)
   return JsonResponse({'message': 'Invalid request method'}, status=405)
 
# Create your views here.
  
 