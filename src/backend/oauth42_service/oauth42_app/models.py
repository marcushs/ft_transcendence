import os

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin
import uuid

class UserManager(BaseUserManager):
    def create_user(self, id, email, username, first_name, last_name, profile_image_link):
        email = self.normalize_email(email)
        user = self.model(id=id,
                          email=email, 
                          username=username, 
                          first_name=first_name, 
                          last_name=last_name, 
                          profile_image_link=profile_image_link)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    username = models.CharField(max_length=12, unique=True, default='default')
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    profile_image_link = models.CharField(blank=True, null=True, default='https://cdn.intra.42.fr/users/8df16944f4ad575aa6c4ef62f5171bca/acarlott.jpg')
    is_verified = models.BooleanField(default=False)
    two_factor_method = models.CharField(max_length=20,  choices=[('email', 'Email'), ('authenticator', 'Authenticator App')], blank=True)
    logged_in_with_oauth = models.BooleanField(default=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()
    
    def __str__(self):
      return self.username

    def to_dict(self):
        return {
            'user_id': str(self.id),
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'profile_image_link': self.profile_image_link,
            'is_verified': self.is_verified,
            'two_factor_method': self.two_factor_method,
            'logged_in_with_oauth': self.logged_in_with_oauth
        }
