from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.http import JsonResponse 
from django.views import View
import json
import datetime

User = get_user_model()

class MatchHistoryView(View):
    def __init__(self):
        super()


    def get(self, request):
        if isinstance(request.user, AnonymousUser):
            return JsonResponse({'message': 'No connected user'}, status=401)
        history = list(User.match_history(request.user).values())
        sorted_history_by_date = sorted(history, key=lambda item: item['date'], reverse=True)
        return JsonResponse(history[:5], safe=False, status=200)