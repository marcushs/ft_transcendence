import os

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin

def user_directory_path(instance, filename):
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


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=12, unique=True, default='default')
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_verified = models.BooleanField(default=False)
    two_factor_method = models.CharField(max_length=20,  choices=[('email', 'Email'), ('authenticator', 'Authenticator App')], blank=True)
    logged_in_with_42 = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()
    
    def __str__(self):
      return self.username

  
    def to_dict(self):
        return {
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'is_verified': self.is_verified,
            'two_factor_method': self.two_factor_method
        }
