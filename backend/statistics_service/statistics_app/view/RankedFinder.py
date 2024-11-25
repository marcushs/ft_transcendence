from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.views import View
from ..models import User
import redis


@method_decorator(csrf_exempt, name='dispatch') 
class GetMatchableRankedPlayers(View):
    def __init__(self):
        super()
        
        self.ranks = {
            'bronze': (0, 999),
            'silver': (1000, 2999),
            'gold': (3000, 5999),
            'diamond': (6000, 9999),
            'master': (10000, float('inf'))
        }

    def get(self, request):
        try:
            waiting_users = self.get_ranked_waiting_list()
            matchable_players = self.get_matchable_pairs(waiting_users)
            
            if matchable_players:
                return JsonResponse({'status': 'success', 'players': matchable_players}, status=200)
            return JsonResponse({'status': 'error'}, status=200)
        except Exception as e: 
            print(f'Error : {str(e)}')
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


    def get_ranked_waiting_list(self):
        redis_instance = redis.Redis(host='redis', port=6379, db=0)
        waiting_users_id = redis_instance.lrange(f'ranked_waiting_users', 0, -1)
        waiting_users_id = [user_id.decode() for user_id in waiting_users_id]
        waiting_users = User.objects.filter(id__in=waiting_users_id)
        if not waiting_users.exists():
            return []
        return list(waiting_users)


    def get_matchable_pairs(self, waiting_users): 
        matchable_players = None
        
        for i, player_one in enumerate(waiting_users):
            for player_two in waiting_users[i + 1:]:
                if self.is_matchable_pair(player_one=player_one, player_two=player_two):
                    matchable_players = (player_one.id, player_two.id)
                    break
            if matchable_players: 
                break
        if matchable_players:
            return matchable_players
        return None


    def is_matchable_pair(self, player_one, player_two):
        player_one_rank = self.get_rank(player_one.rankPoints)
        player_two_rank = self.get_rank(player_two.rankPoints)
        if player_one_rank is None or player_two_rank is None:
            raise Exception('Bad user rank point')
        if player_one_rank == player_two_rank: 
            return True
        ranks_order = list(self.ranks.keys())
        player_one_rank_index = ranks_order.index(player_one_rank) 
        player_two_rank_index = ranks_order.index(player_two_rank)
        return abs(player_one_rank_index - player_two_rank_index) == 1


    def get_rank(self, points):
        for rank, (min, max) in self.ranks.items():
            if min <= points <= max:
                return rank