from django.utils import timezone
from datetime import timedelta
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin

class UserManager(BaseUserManager):
    def create_user(self, email, username, user_id):
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The username field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username)
        user.set_password(None)
        user.id = user_id
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=12, unique=True, default='default')
    email = models.EmailField(unique=True)
    profile_image = models.URLField(blank=True, null=True, default='https://cdn.intra.42.fr/users/8df16944f4ad575aa6c4ef62f5171bca/acarlott.jpg')
    score = models.IntegerField(default=0)
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()
    
    def __str__(self):
      return self.username
  
  
    def to_dict(self):
        return {
            'username': self.username,
            'email': self.email,
            'profile_image': self.profile_image,
            'score': self.score,
            'is_verified': self.is_verified,
        }
    
