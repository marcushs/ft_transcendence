from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.views import View
import json
# from ..decorator import check_jwt
# from django.utils.decorators import method_decorator

class language_view(View):
    def __init__(self):
        super().__init__

#     @method_decorator(check_jwt)
    def get(self, request):
        return JsonResponse({'language': request.user.language}, status=200)

#     @method_decorator(check_jwt)
    def post(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'Language setup failed'}, status=200)
        data = json.loads(request.body.decode('utf-8'))
        if data['language'] == 'fr' or 'en' or 'zh':
            request.user.language = data['language']
        else:
            request.user.language = 'en'
        request.user.save()
        response = JsonResponse({'message': 'Language successfully setup'}, status=200)
        return response
