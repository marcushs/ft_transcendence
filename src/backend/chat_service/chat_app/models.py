from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin
import os
import uuid

def user_directory_path(instance, filename):
    return f'profile_images/{instance.id}/{filename}'

class UserManager(BaseUserManager):
    def create_user(self, email, username, user_id):
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The username field must be set')
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
    status = models.CharField(max_length=10, choices=[('online', 'Online'), ('away', 'Away'), ('ingame', 'In Game'), ('offline', 'Offline')], default='offline')
    last_active = models.DateTimeField(auto_now=True)

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
        
    def get_status(self):
        return {
            'status': self.status,
            'last_active': self.last_active,
        }
    
class ChatGroup(models.Model):
    group_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    users_online = models.ManyToManyField(User, related_name='online_in_groups', blank=True)
    members = models.ManyToManyField(User, related_name='chat_groups', blank=True)
    is_private = models.BooleanField(default=True)

class GroupMessage(models.Model):
	group = models.ForeignKey(ChatGroup, related_name='chat_messages', on_delete=models.CASCADE)
	author = models.ForeignKey(User, on_delete=models.CASCADE)
	body = models.CharField(max_length=300)
	created = models.DateTimeField(auto_now_add=True)
    
	class Meta:
		ordering = ['-created']
