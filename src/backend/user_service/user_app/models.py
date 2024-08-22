from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin
import os

def user_directory_path(instance, filename):
    return f'profile_images/{instance.id}/{filename}'
class UserManager(BaseUserManager):
    def create_user(self, email, username, user_id):
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The username field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, id=user_id)
        user.set_unusable_password()
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    language = models.CharField(max_length=4, null=True, default=None)
    username = models.CharField(max_length=12, unique=True, default='default')
    email = models.EmailField(unique=True)
    profile_image = models.ImageField(upload_to=user_directory_path, null=True)
    profile_image_link = models.CharField(blank=True, null=True, default='https://cdn.intra.42.fr/users/8df16944f4ad575aa6c4ef62f5171bca/acarlott.jpg')
    is_verified = models.BooleanField(default=False)
    two_factor_method = models.CharField(max_length=20, blank=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
      return self.username

    def save(self, has_new_image=False, *args, **kwargs):
        if has_new_image:
            if self.id: # If instance already exist in db
                try:
                    old_instance = User.objects.get(id=self.id) # Get old instance to check if an image already exists
                    if old_instance.profile_image:
                        if os.path.isfile(old_instance.profile_image.path): # Check if the file exists in file system
                            os.remove(old_instance.profile_image.path)
                except User.DoesNotExist:
                    pass
        super(User, self).save(*args, **kwargs) # To call the real save method

  
    def to_dict(self):
        return {
            'username': self.username,
            'email': self.email,
            'profile_image': self.profile_image.url if self.profile_image else None,
            'profile_image_link': self.profile_image_link,
            'is_verified': self.is_verified,
            'two_factor_method': self.two_factor_method
        }
    
