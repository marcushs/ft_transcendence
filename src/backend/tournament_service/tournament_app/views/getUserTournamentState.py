from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from ..db_utils import *
from django.db.models import Q

User = get_user_model()

class getUserTournamentState(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		try:
			user = request.user

			if isinstance(user, AnonymousUser):
				return JsonResponse({'message': 'User not found'}, status=401)

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
						 			'state': 'matchState',
									'tournamentData': user_tournament.to_dict_sync(),
									'matchData': user_match.to_dict_sync()}, status=200)
			
			if user.status == 'in_game':
				user_match = TournamentMatch.objects.get(players=user, isOver=False)
				return JsonResponse({'isInTournament': True, 
					'state': 'inGame',
					'tournamentData': user_tournament.to_dict_sync(),
					'matchData': user_match.to_dict_sync()}, status=200)
			
			if user.status == 'lost_match':
				lost_match = TournamentMatch.objects.filter(
								players=user,
								isOver=True,
								loser=user
							).order_by('-date').first()  
				return JsonResponse({'isInTournament': True, 
						 			'state': 'tournamentLost',
									'tournamentData': user_tournament.to_dict_sync(), 
									'matchData': lost_match.to_dict_sync()}, status=200)
			
			if user.status == 'won_tournament':
				bracket = Bracket.objects.get(tournament=user_tournament)
				bracket_dict = bracket.to_dict_sync()
				bracket_dict['alias'] = user.alias
				return JsonResponse({'isInTournament': True, 
					'state': 'tournamentWon',
					'tournamentData': bracket_dict,
					'matchData': None}, status=200) 

		except Tournament.DoesNotExist:
			return JsonResponse({'message': 'tournamentNotFound'}, status=404)
		except TournamentMatch.DoesNotExist:
			return JsonResponse({'message': 'tournamentMatchNotFound'}, status=404)
		except Bracket.DoesNotExist:
			return JsonResponse({'message': 'bracketNotFound'}, status=404)
		except Exception as e:
			print('Error: ', str(e))
			return JsonResponse({"message": str(e)}, status=500)
