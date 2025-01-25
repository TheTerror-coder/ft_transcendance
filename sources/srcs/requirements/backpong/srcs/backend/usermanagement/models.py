from django.contrib.auth.models import AbstractUser
from django.db import models
from .validators import validate_image_extension
from django.utils.html import mark_safe
from django.conf import settings

class CustomUser(AbstractUser):
    username = models.CharField(max_length=10, unique=True)
    email = models.EmailField(unique=True)
    photo = models.ImageField(
        upload_to='photos/',
        blank=True,
        null=True,
        default='photos/default.png',
        validators=[validate_image_extension]
    )
    photo_link = models.CharField("42 user photo link", max_length=200, blank=True)
    friend_list = models.ManyToManyField('self', symmetrical=False, blank=True)
    victories = models.IntegerField(default=0)
    loose = models.IntegerField(default=0)
    prime = models.IntegerField(default=0)
    games_played = models.IntegerField(default=0)
    language = models.CharField(
        blank=True,
        default="en",
        max_length=10,
    )

    def recent_games(self):
            return Game.objects.filter(models.Q(player=self) | models.Q(opponent=self)).order_by('-date')[:3]

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def photo_tag(self):
        if self.photo:
            return mark_safe(f'<img src="{self.photo.url}" width="50" height="50" />')
        return "No Image"
    photo_tag.short_description = 'Photo'

    def friends_list(self):
        return ", ".join([friend.username for friend in self.friend_list.all()])
    friends_list.short_description = 'Friends'


class Game(models.Model):
    player = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='games_as_player'
    )
    opponent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='games_as_opponent'
    )
    player_score = models.IntegerField()
    opponent_score = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)

    def winner(self):
        if self.player_score > self.opponent_score:
            return self.player
        elif self.opponent_score > self.player_score:
            return self.opponent
        return None

    def __str__(self):
        return f"{self.player.username} vs {self.opponent.username} on {self.date.strftime('%Y-%m-%d')}"


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
