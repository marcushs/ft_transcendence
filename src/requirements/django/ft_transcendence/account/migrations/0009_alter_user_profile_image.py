# Generated by Django 5.0.6 on 2024-07-10 09:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0008_alter_user_profile_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='profile_image',
            field=models.BinaryField(blank=True, null=True),
        ),
    ]
