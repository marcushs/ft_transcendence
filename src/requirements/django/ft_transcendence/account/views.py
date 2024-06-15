from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .constants import REGEX_EMAIL_CHECK, REGEX_USERNAME_CHECK
from django.views.decorators.http import require_POST

import json
import re

def index(request):
    print(request.method)
    data = "asdfaddfadfasdfasdfasdfasdfasdfsdfsfsfasfasdfsd"
    return JsonResponse({"message": data})

@require_POST
@csrf_exempt
def logout(request):
    if request.method == 'POST':
        if request.user.is_authenticated:
            auth_logout(request)
            messages.success(request, ("Succesfully log out !"))
            return JsonResponse({'message': 'Logout successfully'}, status=201)
        else:
            return JsonResponse({'error': 'You are not logged'}, status=401)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def login(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        if not data['username']:
            return JsonResponse({'error': 'No username provided'}, status=401)
        if not data['password']:
            return JsonResponse({'error': 'No password provided'}, status=401)
        if request.user.is_authenticated:
            return JsonResponse({'error': 'You are already logged in'}, status=401)
        user = authenticate(request, username=data['username'], password=data['password'])
        if user is not None:
            auth_login(request, user)
            return JsonResponse({'message': 'Login successfully'}, status=201)
        else:
            return JsonResponse({'error': 'Invalid username or password, please try again'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        if not data['user_name']:
            return JsonResponse({'error': 'No username provided'}, status=401)
        elif not re.match(REGEX_USERNAME_CHECK, data['user_name']):
            return JsonResponse({'error': 'Invalid characters in username'}, status=401)
        elif not data['email']:
            return JsonResponse({'error': 'No email provided'}, status=401)
        elif User.objects.filter(email=data['email']).exists():
            return JsonResponse({'error': 'This email have already an account'}, status=401)
        elif not re.match(REGEX_EMAIL_CHECK, data['email']):
            return JsonResponse({'error': 'Invalid email'}, status=401)
        elif not data['password']:
            return JsonResponse({'error': 'No password provided'}, status=401)
        try:
            validate_password(data['password'])
        except ValidationError as error:
            return JsonResponse({'error': str(error.messages[0])}, status=401)
        if data['password'] == data['confirm_password']:
            username = data['user_name']
            email = data['email']
            password = data['password']
            if not User.objects.filter(username=username).exists():
                User.objects.create_user(username=username, email=email, password=password)
                return JsonResponse({'message': 'User created successfully'}, status=201)
            else:
                return JsonResponse({'error': 'Username already exists'}, status=401)
        else:
            return JsonResponse({'error': 'Password did not match'}, status=401)
    return JsonResponse({'error': 'Invalid request method'}, status=405)
 
# Create your views here.
  
 