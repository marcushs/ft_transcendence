from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin
import uuid
from django.utils import timezone

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

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
        }

class Tournament(models.Model):
    tournament_name = models.CharField(max_length=30, unique=True, editable=False)
    creator = models.UUIDField()
    tournament_size = models.IntegerField()
    members = models.ManyToManyField(User, related_name='chat_groups', blank=True)
    creation_time = models.DateTimeField(default=timezone.now)


    def to_dict(self):
        return {
            'tournament_name': self.tournament_name,
            'creator': self.creator,
            'tournament_size': self.tournament_size,
            'creation_time': self.creation_time,
            'members': list(self.members.all().values('id', 'username')),
        }

class TournamentMatch(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='tournament_match', on_delete=models.CASCADE)
    winner = models.ForeignKey(User, related_name='won_matches', on_delete=models.CASCADE)
    loser = models.ForeignKey(User, related_name='lost_matches', on_delete=models.CASCADE)
    winner_score = models.IntegerField()
    loser_score = models.IntegerField()
    date = models.DateTimeField(default=timezone.now)
    tournament_round = models.CharField()
