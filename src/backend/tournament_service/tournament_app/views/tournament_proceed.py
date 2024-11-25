from ..models import Tournament, User, Bracket, TournamentMatchPlayer, TournamentMatch
from ..utils.weboscket_utils import send_websocket_info
from .tournament_leave import start_leave_countdown, exit_tournament
from .match_countdown import start_match_countdown
from ..consumers import connections, connections_lock
from asgiref.sync import sync_to_async, async_to_sync
from django.shortcuts import aget_object_or_404
from django.db import transaction
from django.http import Http404


async def tournament_proceed_manager(data):
	try:
		last_match = data['match']
		player = await aget_object_or_404(User, id=data['user_id'])
		tournament = await aget_object_or_404(Tournament, tournament_id=last_match['tournament_id'])
		if tournament.isOver == True:
			return await send_websocket_info(player_id=data['user_id'], payload={'type': 'send_external_error_message', 'event': 'next_round', 'message': 'Tournament is over'})
		tournament_bracket = await sync_to_async(lambda: Bracket.objects.filter(tournament=tournament).first())()  
		if tournament_bracket is None:
			return await send_websocket_info(player_id=data['user_id'], payload={'type': 'send_external_error_message', 'event': 'next_round', 'message': 'Bracket not found'})
		await match_in_next_round(user=player, last_match=last_match, tournament_bracket=tournament_bracket, tournament=tournament)
	except Http404:
		return await send_websocket_info(player_id=data['user_id'], payload={'type': data['type'], 'event': 'next_round', 'message': 'Error in finding last match or user'})


async def match_in_next_round(user, last_match, tournament_bracket, tournament): 
	last_round = last_match['tournament_round']
	if last_round == 'finals':
		tournament_bracket_dict = await sync_to_async(tournament_bracket.to_dict_sync)()
		tournament_bracket_dict['alias'] = user.alias
		user.status = 'won_tournament'
		await sync_to_async(user.save)()
		async with connections_lock: 
			if str(str(user.id)) in connections:
				print(f'user: {str(user.id)} active in connections list, starting leave_countdown')
				await start_leave_countdown(user_id=str(user.id), tournament_id=str(tournament.tournament_id))
				return await send_websocket_info(player_id=str(user.id), payload={'type': 'redirect_to_winner_page', 'tournament_bracket': tournament_bracket_dict})
			else:
				print(f'user: {str(user.id)} not active in connections list, exiting tournament')
				return await exit_tournament(user_id=str(user.id), tournament=tournament)

	round_mapping = {
		'finals': {'target': tournament_bracket.finals, 'matches_per_side': 0},
		'semi_finals': {'target': tournament_bracket.semi_finals, 'matches_per_side': 1},
		'quarter_finals': {'target': tournament_bracket.quarter_finals, 'matches_per_side': 2},
		'eighth_finals': {'target': tournament_bracket.eighth_finals, 'matches_per_side': 4}
	}
	
	next_rounds = {
		'eighth_finals': 'quarter_finals',
		'quarter_finals': 'semi_finals' ,
		'semi_finals': 'finals' 
	}
 
	last_round_matches = round_mapping[last_round]
	next_round = next_rounds[last_round]
	last_match_index = last_match['bracket_index']
	adjacent_match_index = last_match_index + 1 if last_match_index % 2 == 0 else last_match_index - 1

	if last_round_matches['matches_per_side'] > 1: 
		await join_or_create_next_match(tournament_bracket, next_round, last_match_index, adjacent_match_index, user) 
	elif last_round_matches['matches_per_side'] == 1:
		await join_or_create_next_match(tournament_bracket, next_round, last_match_index, adjacent_match_index, user)


async def join_or_create_next_match(tournament_bracket, next_round, last_match_index, adjacent_match_index, user):
		round_mapping = {
			'finals': tournament_bracket.finals,
			'semi_finals': tournament_bracket.semi_finals,
			'quarter_finals': tournament_bracket.quarter_finals, 
			'eighth_finals': tournament_bracket.eighth_finals
		}

		if next_round == 'finals':
			await sync_to_async(join_or_create_finals)(tournament_bracket, next_round, last_match_index, user, round_mapping)
		else:
			await sync_to_async(join_or_create_stage)(tournament_bracket, next_round, last_match_index, user, round_mapping, adjacent_match_index)


def join_or_create_finals(tournament_bracket, next_round, last_match_index, user, round_mapping):
		with transaction.atomic():
			try:
				final_match = round_mapping[next_round].select_for_update().get(
					tournament=tournament_bracket.tournament,
					tournament_round=next_round,
					bracket_index=0
				)
				created = False
			except TournamentMatch.DoesNotExist:
				final_match = round_mapping[next_round].create(
					tournament=tournament_bracket.tournament,
					tournament_round=next_round,
					bracket_index=0 
				) 
				created = True
			
			if created:
				round_mapping[next_round].add(final_match)

			player_count = TournamentMatchPlayer.objects.filter(match=final_match).count()
			
			if player_count < 2:
				player, player_created = TournamentMatchPlayer.objects.get_or_create(
					match=final_match,
					player=user,
					defaults={
						'player_number': TournamentMatchPlayer.PlayerNumber.ONE if last_match_index % 2 == 0 else TournamentMatchPlayer.PlayerNumber.TWO
					}
				)
				
				if player_created:
					final_match.players.add(user)
				
				async_to_sync(send_websocket_info)(
					player_id=str(user.id),
					payload={'type': 'load_match', 'match': final_match.to_dict_sync(), 'from_match': True}
				)
				
				if TournamentMatchPlayer.objects.filter(match=final_match).count() == 2:
					player_ids = list(TournamentMatchPlayer.objects.filter(match_id=final_match.match_id).values_list('player_id', flat=True))
					
					async_to_sync(send_websocket_info)(player_id=str(player_ids[0]), payload={'type': 'load_match', 'match': final_match.to_dict_sync(), 'from_match': True})
					async_to_sync(send_websocket_info)(player_id=str(player_ids[1]), payload={'type': 'load_match', 'match': final_match.to_dict_sync(), 'from_match': True})					
					async_to_sync(start_match_countdown)(match_id=str(final_match.match_id), player_ids=player_ids)
					
					return final_match
			else:
				return None
		return final_match


def join_or_create_stage(tournament_bracket, next_round, last_match_index, user, round_mapping, adjacent_match_index):
		next_match_index_map = {
			1: 0,
			5: 1,
			9: 2,
			13: 3
		}

		matches_index_sum = last_match_index + adjacent_match_index
		next_match_index = next_match_index_map[matches_index_sum]

		with transaction.atomic():
			try:
				next_match = round_mapping[next_round].select_for_update().get(
					tournament=tournament_bracket.tournament,
					tournament_round=next_round,
					bracket_index=next_match_index
				)
				created = False
			except TournamentMatch.DoesNotExist:
				next_match = round_mapping[next_round].create(
					tournament=tournament_bracket.tournament,
					tournament_round=next_round,
					bracket_index=next_match_index
				) 
				created = True

			if created:
				round_mapping[next_round].add(next_match)

			player_count = TournamentMatchPlayer.objects.filter(match=next_match).count()
			if player_count < 2:
				player, player_created = TournamentMatchPlayer.objects.get_or_create(
					match=next_match,
					player=user,
					defaults={
						'player_number': TournamentMatchPlayer.PlayerNumber.ONE if last_match_index % 2 == 0 else TournamentMatchPlayer.PlayerNumber.TWO
					}
				)

				if player_created:
					next_match.players.add(user)

				payload = {'type': 'load_match', 'match': next_match.to_dict_sync(), 'from_match': True}
				async_to_sync(send_websocket_info)(player_id=str(user.id), payload=payload)

				if TournamentMatchPlayer.objects.filter(match=next_match).count() == 2:
					player_ids = list(TournamentMatchPlayer.objects.filter(match_id=next_match.match_id).values_list('player_id', flat=True))
					payload = {'type': 'load_match', 'match': next_match.to_dict_sync(), 'from_match': True}
					async_to_sync(send_websocket_info)(player_id=str(player_ids[0]), payload=payload)
					async_to_sync(send_websocket_info)(player_id=str(player_ids[1]), payload=payload)
					async_to_sync(start_match_countdown)(match_id=str(next_match.match_id), player_ids=player_ids) 
					return next_match
			else:
				# Handle the case where the match is already full
				return None
		return next_match
