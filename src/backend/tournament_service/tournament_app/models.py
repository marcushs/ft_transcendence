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
        obj_dict['creation_time'] = self.format_datetime(self.creation_time)

        return obj_dict
    
    def get_members(self):
        members = list(self.members.values('id', 'username'))
        return [{'id': str(member['id']), 'username': member['username']} for member in members]
    
    def format_datetime(self, datetime):
        return datetime.strftime('%d/%m/%Y %H:%M')
    
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

class Bracket(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='tournament_bracket', on_delete=models.CASCADE)
    eighth_finals = models.ManyToManyField(TournamentMatch, related_name='eighth_finals_games')
    quarter_finals = models.ManyToManyField(TournamentMatch, related_name='quarter_finals_games')    
    semi_finals = models.ManyToManyField(TournamentMatch, related_name='semi_finals_games')
    finals = models.ForeignKey(TournamentMatch, related_name='finals_game', on_delete=models.CASCADE)   

