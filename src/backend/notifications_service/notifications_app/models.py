import uuid
from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin


class Notification(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='receiver')
    message = models.TextField(null=False, blank=True, default='Error while displaying message')
    type = models.CharField(null=False, blank=True, default='unknown')
    is_read = models.BooleanField(blank=True, null=False, default=False)
    is_read_at =  models.DateTimeField(null=True, default=None)
    uuid = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.receiver.username
    
    def to_dict(self):
        return {
            'sender': self.sender.username,
            'receiver': self.receiver.username,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'uuid': str(self.uuid),
            'created_at': self.created_at.isoformat()
        }

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