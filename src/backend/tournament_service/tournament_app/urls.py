from django.urls import path

from .utils.user_utils import add_new_user, check_username
from .views import createTournamentView, getJoinableTournamentsView

urlpatterns = [
	path('add_user/', add_new_user.as_view(), name='add_user'),
	path('check_username/', check_username.as_view(), name='check_username'),
	path('create_tournament/', createTournamentView.createTournamentView.as_view(), name='create_tournament'),
	path('get_joinable_tournaments/', getJoinableTournamentsView.getJoinableTournamentsView.as_view(), name='get_joinable_tournaments'),
]
