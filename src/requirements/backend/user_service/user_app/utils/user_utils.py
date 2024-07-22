from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.views import View
from ..models import User
import json      

class add_new_user(View):
    def __init__(self):
        super().__init__
    
    def get(self, request):
        return JsonResponse({"message": 'get request successfully reached'}, status=200)
    

    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        if not all(key in data for key in ('email', 'username', 'user_id')):
            return JsonResponse({"message": 'Invalid request, missing some information'}, status=400)
        User.objects.create_user(email=data['email'], username=data['username'], user_id=data['user_id'])
        return JsonResponse({"message": 'user added with success'}, status=200)
    
class update_user(View):
    def __init__(self):
        super().__init__
        
    def get(self, request):
        return JsonResponse({"message": 'get request successfully reached'}, status=200)
    
    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            user_id = data.get('user_id')
            if not user_id:
                return JsonResponse({'error': 'User ID is required'}, status=400)
            user = User.objects.get(id=user_id)
            for field in ['username', 'email', 'is_verified', 'two_factor_method']:
                if field in data:
                    setattr(user, field, data[field])
            user.save()
            return JsonResponse({'message': 'User updated successfully'}, status=200)
        except ObjectDoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)