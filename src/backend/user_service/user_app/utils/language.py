from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.views import View
from ..models import User
import json

class language_view(View):
    def __init__(self):
        super().__init__

    def get(self, request):
        try:
            username = request.GET.get('username', None)
            if username:
                language = self.get_user_language(str(username))
                return JsonResponse({'status': 'success', 'language': language}, status=200)
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'status': 'error', 'message': 'UnknownUser'}, status=200)
            return JsonResponse({'status': 'success', 'language': request.user.language}, status=200)
        except Exception as e:
            print(f'Error: {str(e)}')
            return JsonResponse({'message': 'can\'t find user language preference'}, status=400)
    
    def get_user_language(self, username):
        user = User.objects.get(username=username) 
        return user.language

    def post(self, request):
        try:
            if isinstance(request.user, AnonymousUser): 
                return JsonResponse({'message': 'Language setup failed'}, status=400)
            data = json.loads(request.body.decode('utf-8'))  
            if data['language'] == 'fr' or 'en' or 'zh': 
                request.user.language = str(data['language'])
            else:
                request.user.language = 'en'
            request.user.save()
            response = JsonResponse({'message': 'Language successfully setup'}, status=200)
            return response
        except Exception as e:
            print(f'Error: {str(e)}')
            return JsonResponse({"message": str(e)}, status=400)
