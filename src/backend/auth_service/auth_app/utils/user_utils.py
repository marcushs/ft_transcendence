from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from django.views import View
from ..models import User
import json

class update_user(View):
    def __init__(self):
        super().__init__
    
    def get(self, request):
        return JsonResponse({"message": 'get request successfully reached'}, status=200)

    def post(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'User not found'}, status=400)
        data = json.loads(request.body.decode('utf-8'))
        for field in ['username', 'email', 'is_verified', 'two_factor_method']:
            if field in data:
                setattr(request.user, field, data[field])
        request.user.save()
        return JsonResponse({'message': 'User updated successfully'}, status=200)

class add_oauth_user(View):
    def __init__(self):
        super().__init__

    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        if not all(key in data for key in ('email', 'username')):
            return JsonResponse({"message": 'Invalid request, missing some information', "status": "Error"}, status=400)
        if User.objects.filter(email=data['email']).exists():
            return JsonResponse({'message': 'Email address already registered! Try logging in.', "status": "Error"}, status=400)
        if User.objects.filter(username=data['username']).exists():
            return JsonResponse({'message': 'Username already taken! Try another one.', "status": "Error"}, status=400)
        user = User.objects.create_oauth_user(data)
        return JsonResponse({"message": 'user added with success', "status": "Success", "user_id": user.id}, status=200)

class check_username(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        username = request.GET.get('username')
        print(username) 
        if User.objects.filter(username=username).exists():
            return JsonResponse({"message": "Username already taken! Try another one.", "status": "Error"}, status=400)
        return JsonResponse({"message": "Username is free", "status": "Success"}, status=200)

class delete_user(View):
    def __init__(self):
        super().__init__

    def delete(self, request):
        data = json.loads(request.body)
        user_id = data.get('id')
        if not user_id:
            return JsonResponse({'message': 'User ID is required', 'status': 'Error'}, status=400)

        try:
            user = User.objects.get(id=user_id)
            username = user.username
            user.delete()
            return JsonResponse({'message': f'User {username} deleted successfully', 'status': 'Success'}, status=200)
        except User.DoesNotExist:
            return JsonResponse({'message': 'User not found, no action taken', 'status': 'Success'}, status=204)
    
    def get(self, request):
        return JsonResponse({'message': 'Method not allowed', 'status': 'Error'}, status=405)

    def post(self, request):
        return JsonResponse({'message': 'Method not allowed', 'status': 'Error'}, status=405)
