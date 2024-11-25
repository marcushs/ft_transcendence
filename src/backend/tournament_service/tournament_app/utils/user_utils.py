from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.views import View
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from ..models import User

import json


class DeleteUser(View):
    def __init__(self):
        super().__init__

    def delete(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            if not 'user_id' in data:
                raise ValidationError('missingID')
            user = User.objects.get(id=str(data['user_id']))
            user.delete()
            return JsonResponse({'message': 'User updated successfully'}, status=200)
        except ValidationError as e:
            return JsonResponse({'message': str(e)}, status=400)
        except ObjectDoesNotExist as e:
            return JsonResponse({'message': str(e)}, status=404)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
        
        
class add_new_user(View):
    def __init__(self):
        super().__init__
    
    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            if not all(key in data for key in ('username', 'user_id')):
                raise ValidationError('requestMissingData')
            if User.objects.filter(username=str(data['username'])).exists():
                raise ValidationError('usernameAlreadyTaken')
            if data['logged_in_with_oauth'] and data['logged_in_with_oauth'] is True:
                User.objects.create_oauth_user(data)
            else:
                User.objects.create_user(username=str(data['username']), user_id=str(data['user_id']), alias=str(data['username']))
            return JsonResponse({"message": 'user added with success', "status": "Success"}, status=200)
        except ValidationError as e:
            return JsonResponse({"message": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)
            
    
class update_user(View):
    def __init__(self):
        super().__init__()

    
    def post(self, request): 
        try: 
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'User not found'}, status=401)
            data = json.loads(request.body.decode('utf-8'))
            for field in ['username', 'is_verified', 'two_factor_method']:
                if field in data:
                    setattr(request.user, field, data[field])
            request.user.save()
            return JsonResponse({'message': 'User updated successfully'}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)
