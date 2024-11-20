from django.urls import path

from .utils.user_utils import add_new_user, update_user, DeleteUser
from .views import createTournamentView, getJoinableTournamentsView, tournamentMatchResultView, getBracketView, getMatchByIdView, aliasManager

urlpatterns = [
    path('delete_user/', DeleteUser.as_view(), name='delete_user'),
	path('update_user/', update_user.as_view(), name='update_user'),
	path('add_user/', add_new_user.as_view(), name='add_user'),
	path('create_tournament/', createTournamentView.createTournamentView.as_view(), name='create_tournament'),
	path('get_joinable_tournaments/', getJoinableTournamentsView.getJoinableTournamentsView.as_view(), name='get_joinable_tournaments'),
	path('match_result/', tournamentMatchResultView.tournamentMatchResultView.as_view(), name='tournament_match_result'),
	path('get_bracket/', getBracketView.getBracketView.as_view(), name='get_bracket'),
	path('get_match_by_id/', getMatchByIdView.getMatchByIdView.as_view(), name='get_match_by_id'),
	path('alias/', aliasManager.AliasManager.as_view(), name='alias'),
]
