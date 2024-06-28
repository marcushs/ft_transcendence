# Generated by Django 5.0.6 on 2024-06-28 09:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0003_remove_user_is_verified_remove_user_otp_secret_key'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_verified',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='otp_secret_key',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
