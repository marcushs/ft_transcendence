from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import *
from .db_utils import is_user_in_any_tournament
import math
import re

@database_sync_to_async
def createTournamentInDB(data, user):
	creator = user
	tournament_name = str(data['tournament_name'])
	tournament_size = str(data['tournament_size'])

	if isinstance(creator, AnonymousUser): 
		return None, 'unknownUser'
	if is_user_in_any_tournament(user):
		return None, 'alreadyInTournament'
	if tournament_name is None or is_valid_name(tournament_name) is False:
		return None, 'invalidTournamentName'
	if tournament_size is None or is_valid_size(int(tournament_size)) is False:
		return None, 'invalidTournamentSize'
	if Tournament.objects.filter(tournament_name=tournament_name).filter(isOver=False).exists():
		return None, 'tournamentAlreadyExist'
	
	round_str = ['finals', 'semi_finals', 'quarter_finals', 'eighth-finals']
	round_str_idx = int(math.log2(int(tournament_size))) - 1

	new_tournament = Tournament.objects.create(creator=creator, tournament_name=tournament_name, tournament_size=tournament_size, current_stage=round_str[round_str_idx])
	new_tournament.members.add(creator)
	creator.status = 'joined_tournament'
	creator.save()
	return new_tournament, 'Tournament created successfully' 

def is_valid_size(size):
	return size in {4, 8, 16} 

def is_valid_name(name):
	regexUsernameCheck = r'^[a-zA-Z0-9_-]+$'

	if not re.match(regexUsernameCheck, name):
		return False
	if name == '' or len(name) > 30:
		return False
	return True

