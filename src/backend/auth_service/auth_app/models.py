import os

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin
import uuid

def user_directory_path(instance, filename):# uu
    return f'profile_images/{instance.id}/{filename}'

class UserManager(BaseUserManager):
    def create_user(self, email, username, password, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The username field must be set')
        if not password:
            raise ValueError('The password field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_oauth_user(self, data):
        id = str(data['user_id'])
        email = str(data['email'])
        username = str(data['username'])
        user = self.model(id=id, email=email, username=username, logged_in_with_oauth=True)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    username = models.CharField(max_length=12, unique=True, default='default')
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)
    two_factor_method = models.CharField(choices=[('email', 'Email'), ('authenticator', 'Authenticator App')], blank=True)
    logged_in_with_oauth = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()
    
    def __str__(self):
      return self.username

  
    def to_dict(self):
        return {
            'user_id': self.id,
            'username': self.username,
            'email': self.email,
            'is_verified': self.is_verified,
            'two_factor_method': self.two_factor_method,
            'logged_in_with_oauth': self.logged_in_with_oauth
        }
 