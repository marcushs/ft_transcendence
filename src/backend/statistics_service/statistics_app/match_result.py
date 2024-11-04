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

    def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            if not self.is_valid_data(data):
                raise(Exception('Invalid matchmaking result'))
            self.update_match_result_data(data)
            return JsonResponse({'status': 'success', 'message': 'match data updated'}, status=200)
        except Exception as e:
            print(f'-----------> ERROR: {str(e)}')
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


    def is_valid_data(self, data):
        if 'winner' not in data or 'loser' not in data:
            return False
        winner = data['winner']
        loser = data['loser']
        if not (isinstance(winner, dict) and 'id' in winner and 'score' in winner):
            return False
        if not (isinstance(loser, dict) and 'id' in loser and 'score' in loser):
            return False
        if not 'type' in data:
            return False
        for field in ['unranked', 'ranked', 'tournament']:
            if field == data['type']:
                return True
        return False


    def update_match_result_data(self, data):
        winner, loser = self.get_users_from_result(data)
        self.change_user_games_count(is_game_win=True, user=winner)
        self.change_user_games_count(is_game_win=False, user=loser)
        self.create_new_match_history(data=data, winner_instance=winner, loser_instance=loser)
        if data['type'] == 'ranked':
            self.manage_ranked_result(data=data, winner=winner, loser=loser)
        winner.save()
        loser.save()


    def get_users_from_result(self, data):
        winner = User.objects.get(id=data['winner']['id']) 
        loser = User.objects.get(id=data['loser']['id'])
        return winner, loser


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


    def manage_ranked_result(self, data, winner, loser):
        winner_points = self.manage_ranked_points_change(user=winner, user_score=int(data['winner']['score']), opponent=loser, opponent_score=int(data['loser']['score']))
        loser_points = self.manage_ranked_points_change(user=loser, user_score=int(data['loser']['score']), opponent=winner, opponent_score=int(data['winner']['score']))
        print(f'winner.rankPoints: {winner.rankPoints} -- winner_points: {winner_points}')
        print(f'loser.rankPoints: {loser.rankPoints} -- loser_points: {loser_points}')
        winner.rankPoints += winner_points
        if loser.rankPoints + loser_points >= 0:
            loser.rankPoints += loser_points
        else:
            loser.rankPoints = 0
    
    
    def manage_ranked_points_change(self, user, user_score, opponent, opponent_score): 
        base_point = 100 
        rank_difference = user.rankPoints - opponent.rankPoints
        average_rank = (user.rankPoints + opponent.rankPoints) / 2
        rank_percentage = (rank_difference * 100) / max(1, average_rank)
        score_difference = user_score - opponent_score
        print(f'------> rank_difference: {rank_difference} -- rank percentage : {rank_percentage} -- average_rank: {average_rank} -- score_difference: {score_difference}')
        points = base_point + rank_percentage + score_difference
        if score_difference > 0:
            print(points)
            return round(min(150, points))
        elif score_difference < 0:
            print(points * -1)
            return round(max(-150, points * -1))
        else:
            return 0
    
    
    # if rank_difference < 0:
    #         multiplier = 1 + abs(rank_difference) / (abs(rank_difference) + 1000)
    #     else:
    #         multiplier = 1 - rank_difference / (rank_difference + 1000)
    #     score_ratio = (user_score / max(opponent_score, 1)) / 1000
    #     print(f'user_score: {user_score} -- opponent_score: {opponent_score}')
    #     print(f'rank_difference: {rank_difference} -- user.rankPoints: {user.rankPoints} -- opponent.rankPoints: {opponent.rankPoints}')
    #     print(f'score_ratio: {score_ratio} -- base_point: {base_point}')
    #     print(f'multiplier: {multiplier}')
    #     if user_score > opponent_score:
    #         multiplier = 1 + (abs(rank_difference) / (abs(rank_difference) + 100)) * (1 if rank_difference < 0 else -0.8)
    #         points = base_point * multiplier * score_ratio
    #     elif user_score < opponent_score:
    #         multiplier = 1 - (abs(rank_difference) / (abs(rank_difference) + 100)) * (1 if rank_difference < 0 else -0.8) 
    #         points = -base_point * multiplier * (1 - score_ratio)
    #     else: 
    #         points = 0 
    #     print(f'points: {points}')