from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin
from django.contrib.auth.models import User
from django.utils import timezone
from django.conf import settings
from django.db import models  

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

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
      return self.username


    def save(self, *args, **kwargs):
        super(User, self).save(*args, **kwargs)