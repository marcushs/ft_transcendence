from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from ..db_utils import *

User = get_user_model()

class getUserTournamentState(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		try:
			user = request.user

			if isinstance(user, AnonymousUser):
				return JsonResponse({'error': 'User not found'}, status=401)

			if is_user_in_any_tournament(user) == False:
				return JsonResponse({'isInTournament': False,
						 			'state': None,
									'tournamentData': None,
									'matchData': None }, status=200)
			
			user_tournament = Tournament.objects.get(members=user, isOver=False)
			if user.status == 'joined_tournament':
				return JsonResponse({'isInTournament': True, 
						 			'state': 'waitingRoom',
									'tournamentData': user_tournament.to_dict_sync(),
									'matchData': None}, status=200)
			
			if user.status == 'match':
				user_match = TournamentMatch.objects.get(players=user, isOver=False)
				return JsonResponse({'isInTournament': True, 
						 			'state': 'tournamentMatch',
									'tournamentData': user_tournament.to_dict_sync(),
									'matchData': user_match.to_dict_sync()}, status=200)
			
			if user.status == 'lost_match':
				lost_match = TournamentMatch.objects.filter(loser=user).order_by('-date').first()
				return JsonResponse({'isInTournament': True, 
						 			'state': 'tournamentLost',
									'tournamentData': user_tournament.to_dict_sync(),
									'matchData': lost_match.to_dict_sync()}, status=200)
			
			if user.status == 'won_tournament':
				return JsonResponse({'isInTournament': True, 
					'state': 'tournamentWon',
					'tournamentData': user_tournament.to_dict_sync(),
					'matchData': None}, status=200)

		except Tournament.DoesNotExist:
			return JsonResponse({'message': 'tournamentNotFound'}, status=400)
		except TournamentMatch.DoesNotExist:
			return JsonResponse({'message': 'tournamentMatchNotFound'}, status=400)
		except Exception as e:
			print(f'Error: {str(e)}')
			return JsonResponse({"message": str(e)}, status=400)