from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.views import View
from django.contrib.auth.models import AnonymousUser
import random
import json
import queue

User = get_user_model()

unranked_queue = queue.Queue()
ranked_queue = queue.Queue()


class matchmaking_view(View):
    def __init__(self):
        super()

    def post(self, request):
        if isinstance(request.user, AnonymousUser): 
            return JsonResponse({'status':'error', 'message': 'No connected user'}, status=200)
        data = json.loads(request.body.decode('utf-8'))
        if not self.is_valid_matchmaking_type(data=data):
            return JsonResponse({'status': 'error', 'message': 'Invalid matchmaking type'}, status=400)
        self.start_matchmaking_by_type(data['type'], request)
        return JsonResponse({'status': 'success', 'message': f'User successfully added to {data['type']} queue'}, status=200) 


    def is_valid_matchmaking_type(self, data):
        if not 'type' in data:
            return False
        for field in ['unranked', 'ranked', 'tournament']: 
            if field == data['type']:
                return True 
        return False

    def start_matchmaking_by_type(self, type, request):
        matchmaking_dict = {
            'unranked': self.add_player_to_unranked_queue,
            'ranked': self.add_player_to_ranked_queue,
        }
        
        matchmaking_dict[type](request)
        
        
    def add_player_to_unranked_queue(self, request):
        print('--------- UNRANKED ---------')
        unranked_queue.put(request.user)
        
        
        
    def add_player_to_ranked_queue(self, request):
        arr = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        random.shuffle(arr)
        unranked_queue.put(request.user)
        print(f'--------- RANKED = {arr} ---------')  