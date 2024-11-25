from channels.db import database_sync_to_async
from .models import *
from django.db.models import Q

@database_sync_to_async
def find_player_match(event, user):
    try:
        tournament_stage = event['tournament_bracket']['tournament']['current_stage']

        match = (TournamentMatch.objects
            .filter(
                Q(tournament_round=tournament_stage) &
                Q(tournamentmatchplayer__player_id=user.id) &
                Q(isOver=False) & 
                Q(tournament__isOver=False)
            )
            .prefetch_related(
                Prefetch(
                    'tournamentmatchplayer_set',
                    queryset=TournamentMatchPlayer.objects.select_related('player'),
                    to_attr='match_players'
                )
            )
            .first()
        )
        if match:
            return str(match.match_id)
        else:
            return None
    except Exception as e:
        print(f"Error: {str(e)}") 
        return None
