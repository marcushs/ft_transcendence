import random
from channels.db import database_sync_to_async
from .models import *
import logging

@database_sync_to_async
def init_bracket(tournament):
	members_copy = tournament.get_members().copy()
	random.shuffle(members_copy)

	nb_of_players = tournament.tournament_size
	round = tournament.current_stage

	tournament_bracket = Bracket.objects.create(tournament=tournament)
	round_mapping = {
		'finals': tournament_bracket.finals,
		'semi_finals': tournament_bracket.semi_finals,
		'quarter_finals': tournament_bracket.quarter_finals,
		'eighth_finals': tournament_bracket.eighth_finals
	}

	for i in range(0, nb_of_players, 2):
		try:
			match = TournamentMatch.objects.create(tournament=tournament, tournament_round=round, bracket_index=i // 2)
			player1 = User.objects.get(id=members_copy[i]['id'])
			player2 = User.objects.get(id=members_copy[i + 1]['id'])

			player1obj = TournamentMatchPlayer.objects.create(
				match=match,
				player=player1,
				player_number=TournamentMatchPlayer.PlayerNumber.ONE
			)
			player2obj = TournamentMatchPlayer.objects.create(
				match=match,
				player=player2,
				player_number=TournamentMatchPlayer.PlayerNumber.TWO
			)

			player1.status = 'match'
			player2.status = 'match'
			player1.save()
			player2.save()
			match.players.add(player1)
			match.players.add(player2)
			

			round_mapping[round].add(match)
		except Exception as e: 
			logging.error(f"Error creating match: {str(e)}")

	return tournament_bracket
