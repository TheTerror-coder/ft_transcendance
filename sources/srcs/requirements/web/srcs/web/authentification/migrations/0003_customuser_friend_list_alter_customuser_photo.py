# Generated by Django 5.0.6 on 2024-08-08 09:13

import authentification.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentification', '0002_alter_customuser_photo'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='friend_list',
            field=models.ManyToManyField(blank=True, related_name='friend_set', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='photo',
            field=models.ImageField(blank=True, default='photos/default.png', null=True, upload_to='photos/', validators=[authentification.models.validate_image_extension]),
        ),
    ]