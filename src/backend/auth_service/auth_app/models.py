import os

import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin

def user_directory_path(instance, filename):
    return f'profile_images/{instance.uuid}/{filename}'

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


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=12, unique=True, default='default')
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)
    uuid = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4, unique=True)
    two_factor_method = models.CharField(max_length=20,  choices=[('email', 'Email'), ('authenticator', 'Authenticator App')], blank=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()
     
    def __str__(self):
      return self.username

  
    def to_dict(self):
        return {
            'username': self.username,
            'email': self.email,
            'is_verified': self.is_verified,
            'two_factor_method': self.two_factor_method
        }
