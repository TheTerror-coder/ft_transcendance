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
    photo = models.ImageField(upload_to='../static/media/photos/', blank=True, null=True, default='../static/media/photos/default.png', validators=[validate_image_extension])
    friend_list = models.ManyToManyField('self', symmetrical=False, related_name='friend_set', blank=True)

class FriendRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('DECLINED', 'Declined'),
    )

    from_user = models.ForeignKey(CustomUser, related_name='friend_requests_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(CustomUser, related_name='friend_requests_received', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    

    def accept(self):
        print("accept")
        self.status = 'ACCEPTED'
        self.save()
        self.from_user.friend_list.add(self.to_user)
        self.to_user.friend_list.add(self.from_user)

    def decline(self):
        print("decline")
        self.status = 'DECLINED'
        self.save()
