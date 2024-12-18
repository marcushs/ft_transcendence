from django.urls import path

from .utils.user_utils import add_new_user, update_user, DeleteUser
from .views import getJoinableTournamentsView, tournamentMatchResultView, getBracketView, aliasManager, getUserTournamentState, getAliasById

urlpatterns = [
    path('delete_user/', DeleteUser.as_view(), name='delete_user'),
	path('update_user/', update_user.as_view(), name='update_user'),
	path('add_user/', add_new_user.as_view(), name='add_user'),
	path('get_joinable_tournaments/', getJoinableTournamentsView.getJoinableTournamentsView.as_view(), name='get_joinable_tournaments'),
	path('match_result/', tournamentMatchResultView.tournamentMatchResultView.as_view(), name='tournament_match_result'),
	path('get_bracket/', getBracketView.getBracketView.as_view(), name='get_bracket'),
	path('alias/', aliasManager.AliasManager.as_view(), name='alias'),
	path('get_tournament_state/', getUserTournamentState.getUserTournamentState.as_view(), name='get_tournament_state'),
	path('get_alias_by_id/', getAliasById.getAliasById.as_view(), name='get_alias_by_id'),
]
