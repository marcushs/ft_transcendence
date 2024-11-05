from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.views import View
from ..models import User
import redis


@method_decorator(csrf_exempt, name='dispatch') 
class GetPreviewStatsResult(View):
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
            payload = {
                'old_rank_points': None,
                'new_rank_points': None,
                'rank': None,
                'new_rank': None, #None if no rank up
            }
            return JsonResponse({'status': 'error'}, status=200)
        except Exception as e: 
            print(f'-----------> ERROR: {str(e)}')
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
        