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
        
