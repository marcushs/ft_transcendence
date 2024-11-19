import random
from channels.db import database_sync_to_async
from .models import *

@database_sync_to_async
def init_bracket(tournament):
	members_copy = tournament.get_members().copy()
	random.shuffle(members_copy)

	nb_of_players = tournament.members.count()
	round = tournament.current_stage

	tournament_bracket = Bracket.objects.create(tournament=tournament)
	round_mapping = {
		'finals': tournament_bracket.finals,
		'semi_finals': tournament_bracket.semi_finals,
		'quarter_finals': tournament_bracket.quarter_finals,
		'eighth_finals': tournament_bracket.eighth_finals
	}

	i = 0
	while i < nb_of_players:
		match = TournamentMatch.objects.create(tournament=tournament, tournament_round=round, bracket_index=i // 2)
		TournamentMatchPlayer.objects.create(
			match=match,
			player=User.objects.get(id=members_copy[i]['id']),
			player_number=TournamentMatchPlayer.PlayerNumber.ONE
		)
		TournamentMatchPlayer.objects.create(
			match=match,
			player=User.objects.get(id=members_copy[i + 1]['id']),
			player_number=TournamentMatchPlayer.PlayerNumber.TWO
		)

		round_mapping[round].add(match)
		i += 2

	return tournament_bracket
