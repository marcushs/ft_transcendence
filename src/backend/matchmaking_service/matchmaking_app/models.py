from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin
from django.contrib.auth.models import User
from django.utils import timezone
from django.conf import settings
from django.db import models

class MatchHistory(models.Model):
    match_type_choices = [
        ('ranked', 'Ranked'),
        ('unranked', 'Unranked')
    ]
    winner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='won_matches', on_delete=models.CASCADE)
    loser = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='lost_matches', on_delete=models.CASCADE)
    date = models.DateTimeField(default=timezone.now)
    winner_score = models.IntegerField()
    loser_score = models.IntegerField()
    match_type = models.CharField(max_length=10, choices=match_type_choices)
    
    def __str__(self): 
        return f'winner: {self.winner} vs loser: {self.loser} on {self.date} ({self.match_type})'
    
    class Meta:
        ordering = ['-date']
    

class UserManager(BaseUserManager):
    def create_user(self, username, user_id):
        if not username:
            raise ValueError('The username field must be set')
        user = self.model(username=username, id=user_id)
        user.set_unusable_password()
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=12, unique=True, default='default')
    is_ingame = models.BooleanField(default=False)
    rankPoints = models.IntegerField(default=0)
    gamesWin = models.IntegerField(default=0)
    gamesLoose = models.IntegerField(default=0)


    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
      return self.username


    def save(self, *args, **kwargs):
        super(User, self).save(*args, **kwargs)

    def to_dict(self):
        return {
            'username': self.username,
        }
        
    @property
    def match_history(self): # Retrieve all match history for the user.
        return MatchHistory.objects.filter(models.Q(winner=self) | models.Q(loser=self))