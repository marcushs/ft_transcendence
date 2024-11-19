from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin
import uuid
from django.utils import timezone
import datetime
from asgiref.sync import sync_to_async
from django.forms.models import model_to_dict
from django.db.models import Prefetch

ROUND_CHOICES = [
    ('finals', 'Finals'),
    ('semi_finals', 'Semi-Finals'),
    ('quarter_finals', 'Quarter-Finals'),
    ('eighth_finals', 'Eighth-Finals'),
]

class UserManager(BaseUserManager):
    def create_user(self, username, user_id, alias):
        if not username:
            raise ValueError('The username field must be set')
        if not user_id:
            raise ValueError('The user id field must be set')
        user = self.model(username=username, id=user_id, alias=alias)
        user.set_unusable_password()
        user.save(using=self._db)
        return user
    
    def create_oauth_user(self, data):
        username = data['username']
        user_id = data['user_id']
        user = self.model(id=user_id, username=username, alias=username)
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    username = models.CharField(max_length=12, unique=True, default='default')
    alias = models.CharField(max_length=12, unique=True, default='default')
   
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
      return self.username

    async def to_dict(self):
        obj_dict = {
            'id': str(self.id),
            'username': self.username,
            'alias': self.alias
        }
        return obj_dict

    def to_dict_sync(self):
        obj_dict = {
            'id': str(self.id),
            'username': self.username,
            'alias': self.alias
        }
        return obj_dict

class Tournament(models.Model):
    tournament_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    tournament_name = models.CharField(max_length=30, unique=True, editable=False)
    creator = models.ForeignKey(User, related_name='created_tournaments', on_delete=models.CASCADE)
    tournament_size = models.IntegerField()
    members = models.ManyToManyField(User, related_name='joined_tournaments', blank=True)
    creation_time = models.DateTimeField(default=timezone.now)
    current_stage = models.CharField(max_length=20, choices=ROUND_CHOICES)
    isOver = models.BooleanField(default=False)
    isJoinable = models.BooleanField(default=True)

    async def to_dict(self):
        # Convert the main object to a dict
        obj_dict = await sync_to_async(model_to_dict)(self)

        obj_dict['tournament_id'] = str(self.tournament_id)
        obj_dict['tournament_name'] = self.tournament_name
        obj_dict['tournament_size'] = int(self.tournament_size)
        creator = await sync_to_async(lambda: self.creator)()

        obj_dict['creator'] = await creator.to_dict()

        # Convert members (ManyToMany field) to list of dicts with 'id' and 'username'
        members = await sync_to_async(list)(
            self.members.values('id', 'username', 'alias')
        )
        obj_dict['members'] = [{'id': str(member['id']), 'username': member['username'], 'alias': member['alias']} for member in members]
        obj_dict['member_count'] = len(members)
        obj_dict['creation_time'] = format_datetime(self.creation_time)
        obj_dict['current_stage'] = self.current_stage

        return obj_dict
    
    def to_dict_sync(self):
        # Convert the main object to a dict
        obj_dict = model_to_dict(self)

        obj_dict['tournament_id'] = str(self.tournament_id)
        obj_dict['tournament_name'] = self.tournament_name
        obj_dict['tournament_size'] = int(self.tournament_size)
        obj_dict['creator'] = self.creator.to_dict_sync()

        # Convert members (ManyToMany field) to list of dicts with 'id' and 'username'
        members = list(
            self.members.values('id', 'username', 'alias')
        )
        obj_dict['members'] = [{'id': str(member['id']), 'username': member['username'], 'alias': member['alias']} for member in members]
        obj_dict['member_count'] = len(members)
        obj_dict['creation_time'] = format_datetime(self.creation_time)
        obj_dict['current_stage'] = self.current_stage

        return obj_dict
    
    async def get_current_stage(self):
        return self.current_stage
    
    def get_members(self):
        members = list(self.members.values('id', 'username', 'alias'))
        return [{'id': str(member['id']), 'username': member['username'], 'alias': member['alias']} for member in members]
    
    def is_not_full(self):
        return self.members.count() < self.tournament_size
    
class TournamentMatch(models.Model):
    match_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    tournament = models.ForeignKey(Tournament, related_name='tournament_match', on_delete=models.CASCADE)
    players = models.ManyToManyField(User, related_name='matches')
    winner = models.ForeignKey(User, related_name='won_matches', on_delete=models.CASCADE, null=True, blank=True)
    loser = models.ForeignKey(User, related_name='lost_matches', on_delete=models.CASCADE, null=True, blank=True)
    winner_score = models.IntegerField(default=0)
    loser_score = models.IntegerField(default=0)
    date = models.DateTimeField(default=timezone.now)
    tournament_round = models.CharField(max_length=20, choices=ROUND_CHOICES)
    bracket_index = models.IntegerField(default=0)
    isOver = models.BooleanField(default=False)

    async def to_dict(self):
        obj_dict = {
            'match_id': str(self.match_id),
            'winner': self.winner,
            'loser': self.loser,
            'winner_score': self.winner_score,
            'loser_score': self.loser_score,
            'date': format_datetime(self.date),
            'tournament_round': self.tournament_round,
            'bracket_index': self.bracket_index
        }
        if self.winner is not None:
            obj_dict['winner'] = await self.winner.to_dict()
        if self.loser is not None:
            obj_dict['loser'] = await self.loser.to_dict()
        tournament =  await sync_to_async(lambda: self.tournament)()
        obj_dict['tournament_id'] = str(tournament.tournament_id)
        obj_dict['tournament_name'] = tournament.tournament_name
        players = await sync_to_async(lambda: list(TournamentMatchPlayer.objects.filter(match=self).select_related('player')))()
        obj_dict['players'] = [{'id': str(player.player.id), 
                                'username': player.player.username, 
                                'alias': player.player.alias, 
                                'player_number': player.player_number, 
                                'ready': player.ready_for_match} for player in players]

        return obj_dict
    
    def to_dict_sync(self):
        obj_dict = {
            'match_id': str(self.match_id),
            'tournament_id': str(self.tournament.tournament_id),
            'winner': self.winner,
            'loser': self.loser,
            'winner_score': self.winner_score,
            'loser_score': self.loser_score,
            'date': format_datetime(self.date),
            'tournament_round': self.tournament_round,
            'bracket_index': self.bracket_index
        }
        if self.winner is not None:
            obj_dict['winner'] = self.winner.to_dict_sync()
        if self.loser is not None:
            obj_dict['loser'] = self.loser.to_dict_sync()
        obj_dict['tournament_name'] = self.tournament.tournament_name
        players = TournamentMatchPlayer.objects.filter(match=self).select_related('player')
        obj_dict['players'] = [{'id': str(player.player.id), 
                                'username': player.player.username, 
                                'alias': player.player.alias, 
                                'player_number': player.player_number, 
                                'ready': player.ready_for_match} for player in players]

        return obj_dict

    def get_players(self):
        players = TournamentMatchPlayer.objects.filter(match=self).select_related('player')
        return [{'id': str(player.player.id), 
                 'username': player.player.username, 
                 'alias': player.player.alias, 
                 'player_number': player.player_number, 
                 'ready': player.ready_for_match} for player in players]

class TournamentMatchPlayer(models.Model):
    class PlayerNumber(models.IntegerChoices):
        ONE = 0, 'One'
        TWO = 1, 'Two'
    match = models.ForeignKey(TournamentMatch, on_delete=models.CASCADE)
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    player_number = models.IntegerField(choices=PlayerNumber.choices, default=PlayerNumber.ONE)
    ready_for_match = models.BooleanField(default=False)

    class Meta:
        unique_together = ('match', 'player')

class Bracket(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='tournament_bracket', on_delete=models.CASCADE)
    eighth_finals = models.ManyToManyField(TournamentMatch, related_name='eighth_finals_games')
    quarter_finals = models.ManyToManyField(TournamentMatch, related_name='quarter_finals_games')
    semi_finals = models.ManyToManyField(TournamentMatch, related_name='semi_finals_games')
    finals = models.ManyToManyField(TournamentMatch, related_name='finals_game')

    async def to_dict(self):
        # Prefetch related TournamentMatch objects
        bracket = await sync_to_async(Bracket.objects.prefetch_related(
            Prefetch('eighth_finals', queryset=TournamentMatch.objects.select_related('tournament').prefetch_related('players')),
            Prefetch('quarter_finals', queryset=TournamentMatch.objects.select_related('tournament').prefetch_related('players')),
            Prefetch('semi_finals', queryset=TournamentMatch.objects.select_related('tournament').prefetch_related('players')),
            Prefetch('finals', queryset=TournamentMatch.objects.select_related('tournament').prefetch_related('players'))
        ).get)(pk=self.pk)

        obj_dict = {
            'tournament': await self.tournament.to_dict(), 
        }

        # Function to convert matches to dicts asynchronously
        async def matches_to_dicts(matches):
            return [await match.to_dict() for match in matches]
 
        # Add match arrays to the dictionary
        obj_dict['eighth_finals'] = await matches_to_dicts(bracket.eighth_finals.all())
        obj_dict['quarter_finals'] = await matches_to_dicts(bracket.quarter_finals.all())
        obj_dict['semi_finals'] = await matches_to_dicts(bracket.semi_finals.all())
        obj_dict['finals'] = await matches_to_dicts(bracket.finals.all())

        return obj_dict
    
    def to_dict_sync(self):
        # Prefetch related TournamentMatch objects
        bracket = Bracket.objects.prefetch_related(
            Prefetch('eighth_finals', queryset=TournamentMatch.objects.select_related('tournament').prefetch_related('players')),
            Prefetch('quarter_finals', queryset=TournamentMatch.objects.select_related('tournament').prefetch_related('players')),
            Prefetch('semi_finals', queryset=TournamentMatch.objects.select_related('tournament').prefetch_related('players')),
            Prefetch('finals', queryset=TournamentMatch.objects.select_related('tournament').prefetch_related('players'))
        ).get(pk=self.pk)

        obj_dict = {
            'tournament': self.tournament.to_dict_sync(), 
        }

        def matches_to_dicts(matches):
            return [match.to_dict_sync() for match in matches]
 
        # Add match arrays to the dictionary
        obj_dict['eighth_finals'] = matches_to_dicts(bracket.eighth_finals.all())
        obj_dict['quarter_finals'] = matches_to_dicts(bracket.quarter_finals.all())
        obj_dict['semi_finals'] = matches_to_dicts(bracket.semi_finals.all())
        obj_dict['finals'] = matches_to_dicts(bracket.finals.all())

        return obj_dict
    

def format_datetime(datetime):
    return datetime.strftime('%d/%m/%Y %H:%M')
