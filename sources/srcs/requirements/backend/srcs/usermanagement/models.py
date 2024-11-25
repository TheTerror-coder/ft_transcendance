from django.contrib.auth.models import AbstractUser
from django.db import models
from .validators import validate_image_extension
from django.utils.html import mark_safe

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    photo = models.ImageField(
        upload_to='photos/',
        blank=True,
        null=True,
        default='photos/default.png',
        validators=[validate_image_extension]
    )
    friend_list = models.ManyToManyField('self', symmetrical=False, blank=True)
    victories = models.IntegerField(default=0)
    games_played = models.IntegerField(default=0)

    def recent_games(self):
        return Game.objects.filter(player=self).order_by('-date')[:3]

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def photo_tag(self):
        if self.photo:
            return mark_safe(f'<img src="{self.photo.url}" width="50" height="50" />')
        return "No Image"
    photo_tag.short_description = 'Photo'


class Game(models.Model):
    player = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="games_as_player")
    opponent = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="games_as_opponent")
    player_score = models.IntegerField()
    opponent_score = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Game: {self.player.username} vs {self.opponent.username} on {self.date.strftime('%Y-%m-%d')}"


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
        self.status = 'ACCEPTED'
        self.save()
        self.from_user.friend_list.add(self.to_user)
        self.to_user.friend_list.add(self.from_user)

    def decline(self):
        self.status = 'DECLINED'
        self.save()
