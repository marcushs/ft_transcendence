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
        if data['password'] == data['confirm_password']:
            print(data)
            response_data = {
                'message': 'Signup successful!',
            }
            username = data['username']
            email = data['email']
            password = data['password']
            if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(username=username, email=email, password=password)
            return JsonResponse({'message': 'User created successfully'}, status=201)
        else:
            return JsonResponse({'error': 'Username already exists'}, status=400)
            return JsonResponse(response_data)
        else:
            return JsonResponse({'message': 'Passwords do not match'})
   return JsonResponse({'message': 'Invalid request method'}, status=405)
 
# Create your views here.
  
 