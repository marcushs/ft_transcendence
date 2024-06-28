from django.contrib.auth.models import AbstractUser
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
    
class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=12, unique=True, default='default')
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    profile_image = models.URLField(blank=True, null=True, default='https://cdn.intra.42.fr/users/8df16944f4ad575aa6c4ef62f5171bca/acarlott.jpg')
    score = models.IntegerField(default=0)
    otp_secret_key = models.CharField(max_length=255, blank=True, null=True)
    is_verified = is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()
 
    def __str__(self):
      return self.username
# Create your models here.
