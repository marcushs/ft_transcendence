from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.views import View
from ..models import User
import json

class update_user(View):
    def __init__(self):
        super().__init__


    def post(self, request):
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'User not found'}, status=400)
            data = json.loads(request.body.decode('utf-8'))
            for field in ['username', 'email', 'is_verified', 'two_factor_method']:
                if field in data:
                    setattr(request.user, field, data[field])
            request.user.save()
            return JsonResponse({'message': 'User updated successfully'}, status=200)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=400)


class add_oauth_user(View):
    def __init__(self):
        super().__init__

    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            if not all(key in data for key in ('email', 'username')):
                return JsonResponse({"message": 'Invalid request, missing some information', "status": "Error"}, status=400)
            if User.objects.filter(email=data['email']).exists():
                return JsonResponse({'message': 'Email address already registered! Try logging in.', "status": "Error"}, status=400)
            if User.objects.filter(username=data['username']).exists():
                return JsonResponse({'message': 'Username already taken! Try another one.', "status": "Error"}, status=400)
            user = User.objects.create_oauth_user(data)
            return JsonResponse({"message": 'user added with success', "status": "Success", "user_id": user.id}, status=200)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=400)
