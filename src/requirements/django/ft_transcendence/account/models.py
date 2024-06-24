from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    otp_secret_key = models.CharField(max_length=255, blank=True, null=True)
    is_verified = is_verified = models.BooleanField(default=False)


    def to_dict(self):
        return {
            "username": self.username,
            "email": self.email,
            "is_staff": self.is_staff,
            "is_verified": self.is_verified,
            "date_joined": self.date_joined.isoformat(),
            "otp_secret_key": self.otp_secret_key,
        }
        
        
    def __str__(self):
        return self.username
