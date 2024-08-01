import os
from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin

class FriendList(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user")
    friends = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="friends")
    
    def __str__(self):
        return self.user.username
    
    def add_friend(self, target_user):
        if not target_user in self.friends.all():
            self.friends.add(target_user)
            self.save()
            
    def remove_friend(self, target_user):
        if target_user in self.friends.all():
            self.friends.remove(target_user)
            self.save()
            
    def unfriend(self, target_user):
        self.remove_friend(target_user)
        friend_list = FriendList.objects.get(user=target_user)
        friend_list.remove_friend(self.user)
        
    def is_mutual_friend(self, friend):
        if friend in self.friends.all():
            return True
        return False
    
class FriendRequest(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sender")
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="receiver")
    is_active = models.BooleanField(blank=True, null=False, default=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.sender.username
    
    def accept(self):
        receiver_friend_list = FriendList.objects.get(user=self.receiver)
        if receiver_friend_list:
            receiver_friend_list.add_friend(self.sender)
            sender_friend_list = FriendList.objects.get(user=self.sender)
            if sender_friend_list:
                sender_friend_list.add_friend(self.receiver)
                self.is_active = False
                self.save()
                
    def decline(self):
        self.is_active = False
        self.save()
        
    def cancel(self):
        self.is_active = False
        self.save()
    
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

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
      return self.username

  
    def save(self, *args, **kwargs):
        super(User, self).save(*args, **kwargs)
    
    def to_dict(self):
        return {
            'username': self.username,
        }
    
