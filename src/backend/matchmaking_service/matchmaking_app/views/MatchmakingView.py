from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.views import View
from django.contrib.auth.models import AnonymousUser
import json

User = get_user_model()

class matchmaking_view(View):
    def __init__(self):
        super()

    def post(self, request):
        if isinstance(request.user, AnonymousUser): 
            return JsonResponse({'status':'error', 'message': 'No connected user'}, status=200)
        data = json.loads(request.body.decode('utf-8'))
        if not self.is_valid_matchmaking_type(data=data):
            return JsonResponse({'status': 'error', 'message': 'Invalid matchmaking type'}, status=400)
        self.start_matchmaking_by_type(data['type'])
        return JsonResponse({'status': 'success', 'message': f'User successfully added to {data['type']} queue'}, status=200) 


    def is_valid_matchmaking_type(self, data):
        if not 'type' in data:
            return False
        for field in ['unranked', 'ranked', 'tournament']: 
            if field == data['type']:
                return True 
        return False

    def start_matchmaking_by_type(self, type):
        matchmaking_dict = {
            'unranked': self.add_player_to_unranked_queue,
            'ranked': self.add_player_to_ranked_queue,
        }
        
        matchmaking_dict[type]()
        
        
    def add_player_to_unranked_queue(self):
        print('--------- UNRANKED ---------')  
        
    def add_player_to_ranked_queue(self):
        print('--------- RANKED ---------')