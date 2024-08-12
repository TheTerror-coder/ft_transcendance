from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError
import os


def validate_image_extension(value):
    if not value:
        return
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.png']
    if not ext.lower() in valid_extensions:
        raise ValidationError('Unsupported file extension. Only .png files are allowed.')

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    photo = models.ImageField(upload_to='photos/', blank=True, null=True, default='photos/default.png', validators=[validate_image_extension])
    friend_list = models.ManyToManyField('self', symmetrical=False, related_name='friend_set', blank=True)
