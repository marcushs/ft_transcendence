from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin
from django.contrib.postgres.fields import ArrayField
import uuid
from django.utils import timezone
import datetime
from asgiref.sync import sync_to_async
from django.forms.models import model_to_dict
import shortuuid
from shortuuid.django_fields import ShortUUIDField
from django.db.models import Prefetch

def user_directory_path(instance, filename):
    return f'profile_images/{instance.id}/{filename}'

class UserManager(BaseUserManager):
    def create_user(self, email, username, user_id):
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The username field must be set')
        if not user_id:
            raise ValueError('The user id field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, id=user_id)
        user.set_unusable_password()
        user.save(using=self._db)
        return user
    
    def create_oauth_user(self, data):
        email = data['email']
        username = data['username']
        user_id = data['user_id']
        user = self.model(id=user_id, email=email, username=username)
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    username = models.CharField(max_length=12, unique=True, default='default')
    email = models.EmailField(unique=True)
   
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
      return self.username

    async def to_dict(self):
        obj_dict = {
            'id': str(self.id),
            'username': self.username
        }
        return obj_dict

class Tournament(models.Model):
    tournament_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    tournament_name = models.CharField(max_length=30, unique=True, editable=False)
    creator = models.ForeignKey(User, related_name='created_tournaments', on_delete=models.CASCADE)
    tournament_size = models.IntegerField()
    members = models.ManyToManyField(User, related_name='joined_tournaments', blank=True)
    creation_time = models.DateTimeField(default=timezone.now)
    isOver = models.BooleanField(default=False)
    
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
            self.members.values('id', 'username')
        )
        obj_dict['members'] = [{'id': str(member['id']), 'username': member['username']} for member in members]
        obj_dict['member_count'] = len(members)
        obj_dict['creation_time'] = format_datetime(self.creation_time)

        return obj_dict
    
    def get_members(self):
        members = list(self.members.values('id', 'username'))
        return [{'id': str(member['id']), 'username': member['username']} for member in members]
    
    def is_not_full(self):
        return self.members.count() < self.tournament_size
    
class TournamentMatch(models.Model):
    match_id = ShortUUIDField(primary_key=True)
    tournament = models.ForeignKey(Tournament, related_name='tournament_match', on_delete=models.CASCADE)
    players = models.ManyToManyField(User, related_name='matches')
    winner = models.ForeignKey(User, related_name='won_matches', on_delete=models.CASCADE, null=True, blank=True)
    loser = models.ForeignKey(User, related_name='lost_matches', on_delete=models.CASCADE, null=True, blank=True)
    winner_score = models.IntegerField(default=0)
    loser_score = models.IntegerField(default=0)
    date = models.DateTimeField(default=timezone.now)
    tournament_round = models.CharField()

    async def to_dict(self):
        obj_dict = {
            'match_id': self.match_id,
            'tournament_id': str(self.tournament.tournament_id),
            'winner': self.winner,
            'loser': self.loser,
            'winner_score': self.winner_score,
            'loser_score': self.loser_score,
            'date': format_datetime(self.date),
            'tournament_round': self.tournament_round
        }
        players = await sync_to_async(list)(
            self.players.values('id', 'username')
        )
        obj_dict['players'] = [{'id': str(player['id']), 'username': player['username']} for player in players]

        return obj_dict

class Bracket(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='tournament_bracket', on_delete=models.CASCADE)
    eighth_finals = models.ManyToManyField(TournamentMatch, related_name='eighth_finals_games')
    quarter_finals = models.ManyToManyField(TournamentMatch, related_name='quarter_finals_games')
    semi_finals = models.ManyToManyField(TournamentMatch, related_name='semi_finals_games')
    finals = models.ManyToManyField(TournamentMatch, related_name='finals_game')

    async def to_dict(self):
        print('-----------------called bracket to_dict-----------------------------')
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

        print(obj_dict)
        return obj_dict

def format_datetime(datetime):
    return datetime.strftime('%d/%m/%Y %H:%M')
