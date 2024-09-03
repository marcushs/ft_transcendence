from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin
import uuid

class UserManager(BaseUserManager):
    def create_user(self, email, username, user_id, logged_in_with_oauth):
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The username field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, id=user_id, logged_in_with_oauth=logged_in_with_oauth)
        user.set_unusable_password()
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    username = models.CharField(max_length=12, unique=True, default='default')
    email = models.EmailField(unique=True)
    two_factor_method = models.CharField(max_length=20,  choices=[('email', 'Email'), ('authenticator', 'Authenticator App')], blank=True)
    two_factor_code = models.CharField(max_length=50, blank=True)
    two_factor_code_expiry = models.DateTimeField(null=True, blank=True)
    authenticator_secret = models.CharField(max_length=50, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    logged_in_with_oauth = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
      return self.username

  
    def to_dict(self):
        return {
            'username': self.username,
            'email': self.email,
            'two_factor_method': self.two_factor_method,
            'score': self.score,
            'is_verified': self.is_verified,
            'logged_in_with_oauth': self.logged_in_with_oauth,
        }
    
    def set_two_factor_code(self, code, expire_in):
        self.two_factor_code = code
        self.two_factor_code_expiry = timezone.now() + timedelta(minutes=expire_in)
        self.save()
