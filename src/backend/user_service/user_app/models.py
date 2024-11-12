from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin
import os
import uuid

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
    
    def create_oauth_user(self, data):
        email = data['email']
        username = data['username']
        profile_image_link = data['profile_image_link']
        user_id = data['user_id']
        user = self.model(id=user_id, email=email, username=username, profile_image_link=profile_image_link, logged_in_with_oauth=True)
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    language = models.CharField(max_length=4, null=True, default='en')
    username = models.CharField(max_length=12, unique=True, default='default')
    email = models.EmailField(unique=True)
    profile_image = models.ImageField(upload_to=user_directory_path, null=True)
    profile_image_link = models.CharField(blank=True, null=True, default='https://cdn.intra.42.fr/users/8df16944f4ad575aa6c4ef62f5171bca/acarlott.jpg')
    is_verified = models.BooleanField(default=False)
    two_factor_method = models.CharField(max_length=20, blank=True)
    logged_in_with_oauth = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=[('online', 'Online'), ('away', 'Away'), ('ingame', 'In Game'), ('offline', 'Offline')], default='offline')
    last_active = models.DateTimeField(auto_now=True)

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
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'profile_image': self.profile_image.url if self.profile_image else None,
            'profile_image_link': self.profile_image_link,
            'is_verified': self.is_verified,
            'two_factor_method': self.two_factor_method,
            'logged_in_with_oauth': self.logged_in_with_oauth,
        }
        
    def get_status(self):
        return {
            'status': self.status,
            'last_active': self.last_active,
        }
    
