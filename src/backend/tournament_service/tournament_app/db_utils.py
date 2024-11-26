from channels.db import database_sync_to_async
from django.db import transaction
from .models import *
from django.core.exceptions import ObjectDoesNotExist
import threading

tournament_delete_lock = threading.Lock()

@database_sync_to_async
def add_user_to_tournament(tournament, user):
	if is_user_in_any_tournament(user=user) == False:
		user.status = 'joined_tournament'
		user.save()
		return tournament.members.add(user)
	return 'User already in tournament'

@database_sync_to_async
def get_members_count(tournament):
	return tournament.members.count()

@database_sync_to_async
def is_user_in_this_tournament(tournament, user):
	return tournament.members.filter(id=user.id).exists()

@database_sync_to_async
def remove_user_from_tournament(tournament, user):
	user.status = 'not_in_tournament'
	user.save()
	tournament.members.remove(user)

def is_user_in_any_tournament(user):
	return Tournament.objects.filter(members=user, isOver=False).exists()

@database_sync_to_async
def user_in_match(match, user):
	return match.players.filter(id=user.id).exists()  

@database_sync_to_async
def set_tournament_not_joinable(tournament):
	with transaction.atomic():
		tournament.isJoinable = False
		tournament.save()

@database_sync_to_async
def delete_tournament_when_empty(tournament):
    with tournament_delete_lock:
        if tournament.members.count() == 0:
            tournament.delete()

def set_tournament_is_over(tournament):
	with transaction.atomic():
		tournament.isOver = True
		tournament.save()

@database_sync_to_async
def get_player_ids_for_match(match_id):
    player_ids = TournamentMatchPlayer.objects.filter(
        match_id=match_id
    ).values_list('player_id', flat=True)
    
    return list(player_ids) 

@database_sync_to_async
def set_player_ready(match_id, user):
	try:
		with transaction.atomic():
			# Get the TournamentMatchPlayer instance for the current user and match
			tournament_match_player = TournamentMatchPlayer.objects.select_related('match').get(
				match__match_id=match_id,
				player=user
			)
			
			# Set the current user as ready
			tournament_match_player.ready_for_match = True
			tournament_match_player.save()
			
			# Get all TournamentMatchPlayer instances for this match
			match_players = TournamentMatchPlayer.objects.filter(match__match_id=match_id)
			
			# Check if both players are ready
			all_players_ready = match_players.count() == 2 and all(player.ready_for_match for player in match_players)
			
			if all_players_ready:
				return 'start game'
			
			return 'Player ready'

	except TournamentMatchPlayer.DoesNotExist:
		return 'Player not in this match'
	except ObjectDoesNotExist:
		return 'Match not found'

