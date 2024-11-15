from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import MatchHistory, User
from django.views import View
import json


@method_decorator(csrf_exempt, name='dispatch') 
class MatchResultManager(View):
    def __init__(self):
        super()
        
        self.winner_old_points = None
        self.loser_old_points = None
        
        self.ranks = {
            'bronze': (0, 999),
            'silver': (1000, 2999),
            'gold': (3000, 5999),
            'diamond': (6000, 9999),
            'master': (10000, float('inf'))
        } 

    def get(self, request):
        return JsonResponse({'status': 'GET  match_resultview reached'}, status=200)

    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            self.is_valid_data(data)
            if not self.update_match_result_data(data):
                return JsonResponse({'status': 'success', 'message': 'result not taken into account, game cancelled with draw'}, status=200)
            if data['type'] == 'ranked':
                winner_rank = self.get_rank(self.winner.rankPoints)
                loser_rank = self.get_rank(self.loser.rankPoints)
                payload = {
                    'winner': {
                        'old_rank_points': self.winner_old_points,
                        'new_rank_points': self.winner.rankPoints, 
                        'rank': self.winner_old_rank,
                        'new_rank': winner_rank if winner_rank != self.winner_old_rank else None
                    },
                    'loser': {
                        'old_rank_points': self.loser_old_points,
                        'new_rank_points': self.loser.rankPoints,
                        'rank': self.loser_old_rank,
                        'new_rank': loser_rank if loser_rank != self.loser_old_rank else None
                    }
                }
                return JsonResponse({'status': 'success', 'results': payload}, status=200)
            return JsonResponse({'status': 'success', 'message': 'match data updated'}, status=200)
        except Exception as e:
            print(f'-> Error: {str(e)}')
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


    def is_valid_data(self, data):
        if 'winner' not in data or 'loser' not in data:
            raise Exception('Missing user in data')
        winner = data['winner']
        loser = data['loser']
        if not (isinstance(winner, dict) and 'id' in winner and 'score' in winner):
            raise Exception('Missing data in winner object')
        if not (isinstance(loser, dict) and 'id' in loser and 'score' in loser):
            raise Exception('Missing data in loser object')
        if not 'type' in data:
            raise Exception('Missing match type in data')
        if 'is_draw' not in data or 'is_surrend' not in data or 'is_canceled' not in data:
            raise Exception('Missing data')
        for field in ['unranked', 'ranked', 'tournament', 'private_match']:
            if field == data['type']:
                return
        raise Exception('Invalid data') 


    def update_match_result_data(self, data):
        self.get_users_from_result(data)
        if data['is_canceled'] is True and data['is_draw']:
            return False
        self.change_user_games_count(is_game_win=True, user=self.winner)
        self.change_user_games_count(is_game_win=False, user=self.loser)
        if data['type'] == 'ranked':
            self.save_old_ranks_value(data=data)
            self.manage_ranked_result(data=data)
        self.winner.goals_scored += data['winner']['score']
        self.winner.goals_conceded += data['loser']['score']
        self.loser.goals_scored += data['loser']['score']
        self.loser.goals_conceded += data['winner']['score']
        if data['type'] == 'unranked':
            self.winner.rankPoints = 925
            self.loser.rankPoints = 925
        self.create_new_match_history(data=data, winner_instance=self.winner, loser_instance=self.loser)
        self.winner.save()
        self.loser.save()
        return True
        

    def get_users_from_result(self, data):
        self.winner = User.objects.get(id=data['winner']['id']) 
        self.loser = User.objects.get(id=data['loser']['id'])


    def change_user_games_count(self, is_game_win, user): 
        if is_game_win:
            user.gamesWin += 1
        else:
            user.gamesLoose += 1

  
    def create_new_match_history(self, data, winner_instance, loser_instance):
        MatchHistory.objects.create(
            winner=winner_instance,
            loser=loser_instance,
            winner_score=int(data['winner']['score']),
            loser_score=int(data['loser']['score']),
            match_type=str(data['type']) 
        )


    def save_old_ranks_value(self, data):
        self.winner_old_rank = self.get_rank(self.winner.rankPoints)
        self.winner_old_points = self.winner.rankPoints
        self.loser_old_points = self.loser.rankPoints
        self.loser_old_rank = self.get_rank(self.loser.rankPoints)


    def get_rank(self, points):
        for rank, (min, max) in self.ranks.items():
            if min <= points <= max:
                return rank
        return None


    def manage_ranked_result(self, data):
        if data['is_surrend'] is True:
            winner_points, loser_points = self.manage_surrend_points_update()
        else:
            winner_points = self.manage_ranked_points_update(user=self.winner, user_score=int(data['winner']['score']), opponent=self.loser, opponent_score=int(data['loser']['score']))
            loser_points = self.manage_ranked_points_update(user=self.loser, user_score=int(data['loser']['score']), opponent=self.winner, opponent_score=int(data['winner']['score']))
        if self.winner.rankPoints + winner_points >= 0:
            self.winner.rankPoints += winner_points
        else:
            self.winner.rankPoints = 0
        if self.loser.rankPoints + loser_points >= 0:
            self.loser.rankPoints += loser_points
        else:
            self.loser.rankPoints = 0


    def manage_surrend_points_update(self):
        base_point = 100
        surrend_penality = 10
        rank_difference = self.loser.rankPoints - self.winner.rankPoints 
        rank_percentage = (abs(rank_difference) * 100) / max(1, self.loser.rankPoints, self.winner.rankPoints)
        if rank_difference > 0:
            points = base_point + rank_percentage + surrend_penality 
        else:
            points = base_point - rank_percentage + surrend_penality
        points_won = round(max(50, min(150, points)))
        points_lost = round(min(-50, max(-150, points * -1)))
        return round(points_won), round(points_lost)


    def manage_ranked_points_update(self, user, user_score, opponent, opponent_score): 
        base_point = 100 
        rank_difference = user.rankPoints - opponent.rankPoints
        rank_percentage = (abs(rank_difference) * 100) / max(1, user.rankPoints, opponent.rankPoints)
        score_difference = user_score - opponent_score
        if score_difference > 0:
            if rank_difference > 0:
                points = base_point - rank_percentage + score_difference
            else:
                points = base_point + rank_percentage + score_difference
            print(points)
            return round(max(50, min(150, points))) 
        elif score_difference < 0:
            if rank_difference > 0:
                points = base_point + rank_percentage + abs(score_difference)
            else:
                points = base_point - rank_percentage + abs(score_difference) 
            print(points * -1)
            return round(min(-50, max(-150, points * -1))) 
        else:
            return 0 