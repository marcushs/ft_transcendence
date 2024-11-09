from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.http import JsonResponse 
from django.views import View

User = get_user_model()

class GetUserStatistics(View):
    def __init__(self):
        super()
        self.user = None
        self.ranks = {
            'bronze': (0, 999),
            'silver': (1000, 2999),
            'gold': (3000, 5999),
            'diamond': (6000, 9999),
            'master': (10000, float('inf'))
        }


    def get(self, request):
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'message': 'No connected user'}, status=401)
            self.check_data(request)
            payload = {
                'rank' : self.get_rank(self.user.rankPoints),
                'rank_points': self.user.rankPoints,
                'goal_ratio': self.get_total_goal_ratio(),
                'win_loose_ratio': self.get_win_loose_ratio(),
                'total_win': self.user.gamesWin,
                'total_loose': self.user.gamesLoose,
                'total_game_played': self.user.gamesWin + self.user.gamesLoose
            }
            return JsonResponse({'status': 'success', 'user_statistics': payload}, status=200)
        except Exception as e:
            print(f'error: {str(e)}')
            return JsonResponse({'message': str(e)}, status=400)


    def check_data(self, request):
        user_id = request.GET.get('q', '')
        if not user_id:
            raise Exception('No user id provided')
        self.user = User.objects.get(id=str(user_id))
        if not self.user:
            raise Exception('User not found')
        
    def get_rank(self, points):
        for rank, (min, max) in self.ranks.items():
            if min <= points <= max:
                return rank
    
    def get_total_goal_ratio(self):
        ratio = self.user.goals_scored / max(1, self.user.goals_conceded)
        return round(ratio, 2)
    
    def get_win_loose_ratio(self):
        ratio = self.user.gamesWin / max(1, self.user.gamesLoose)
        return round(ratio, 2)