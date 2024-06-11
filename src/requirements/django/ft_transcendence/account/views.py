from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

def index(request):
    print(request.method)
    data = "asdfaddfadfasdfasdfasdfasdfasdfsdfsfsfasfasdfsd"
    return JsonResponse({"message": data})

def login(request):
    print(request.method)
    data = "Send from login"
    return JsonResponse({"message": data})

def signup(request):
    print(request.method)
    data = "Send from signup"
    return JsonResponse({"message": data})

# Create your views here.
