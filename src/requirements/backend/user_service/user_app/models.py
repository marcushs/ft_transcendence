from django.utils import timezone
from datetime import timedelta
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin

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
    
    TWO_FACTOR_CHOICES = [
    ('sms', 'SMS'),
    ('email', 'Email'),
    ('authenticator', 'Authenticator App'),
    ]
class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=12, unique=True, default='default')
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    profile_image = models.URLField(blank=True, null=True, default='https://cdn.intra.42.fr/users/8df16944f4ad575aa6c4ef62f5171bca/acarlott.jpg')
    score = models.IntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    two_factor_method = models.CharField(max_length=20,  choices=[('sms', 'SMS'), ('email', 'Email'), ('authenticator', 'Authenticator App')], blank=True)
    two_factor_code = models.CharField(max_length=50, blank=True)
    two_factor_code_expiry = models.DateTimeField(null=True, blank=True)
    authenticator_secret = models.CharField(max_length=50, blank=True, null=True)
    phonenumber = models.CharField(max_length=20, blank=True, null=True)

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
            'profile_image': self.profile_image,
            'score': self.score,
            'is_verified': self.is_verified,
        }
        
        
    def set_two_factor_code(self, code, expire_in):
        self.two_factor_code = code
        self.two_factor_code_expiry = timezone.now() + timedelta(minutes=expire_in)
        self.save()
    
