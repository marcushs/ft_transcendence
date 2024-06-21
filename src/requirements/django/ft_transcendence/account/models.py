from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    profile_image = models.URLField(blank=True, null=True)
    score = models.IntegerField(default=0)
# Create your models here.
