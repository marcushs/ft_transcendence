from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin
from django.contrib.auth.models import User
from django.conf import settings
from django.db import models  
import uuid

class PrivateMatchLobby(models.Model):
    lobby_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    sender = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sender")
    receiver = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="receiver")
    receiver_state = models.CharField(max_length=12, default='waiting')
    
    def join_lobby(self):
        self.receiver_state = 'ready'
        self.save()
    
    def delete_lobby(self):
        self.delete()


class UserManager(BaseUserManager):
    def create_user(self, username, user_id):
        if not username:
            raise ValueError('The username field must be set')
        user = self.model(username=username, id=user_id)
        user.set_unusable_password()
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    username = models.CharField(max_length=12, unique=True, default='default')
    is_ingame = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
      return self.username


    def save(self, *args, **kwargs):
        super(User, self).save(*args, **kwargs)