from django.urls import path

from .utils.user_utils import add_new_user, check_username
from .views import createTournamentView, getJoinableTournamentsView, tournamentMatchResultView, getBracketView, getMatchByIdView

urlpatterns = [
	path('add_user/', add_new_user.as_view(), name='add_user'),
	path('check_username/', check_username.as_view(), name='check_username'),
	path('create_tournament/', createTournamentView.createTournamentView.as_view(), name='create_tournament'),
	path('get_joinable_tournaments/', getJoinableTournamentsView.getJoinableTournamentsView.as_view(), name='get_joinable_tournaments'),
	path('match_result/', tournamentMatchResultView.tournamentMatchResultView.as_view(), name='tournament_match_result'),
	path('get_bracket/', getBracketView.getBracketView.as_view(), name='get_bracket'),
	path('get_match_by_id/', getMatchByIdView.getMatchByIdView.as_view(), name='get_match_by_id'),
]
