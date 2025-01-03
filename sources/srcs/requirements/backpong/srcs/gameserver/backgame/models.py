# from django.db import models
# from django.contrib.auth.models import User

# # Create your models here.
# class GameResult(models.Model):
#     gameCode = models.CharField(max_length=4)
#     date = models.DateTimeField(auto_now_add=True)
#     winnerTeam = models.CharField()
#     loserTeam = models.CharField()
#     winnerScore = models.IntegerField()
#     loserScore = models.IntegerField()
#     winnerPV = models.IntegerField()
#     loserPV = models.IntegerField()

# class PlayerGameStats(models.Model):
#     game = models.ForeignKey(GameResult, on_delete=models.CASCADE)
#     player = models.ForeignKey(User, on_delete=models.CASCADE)
#     team = models.CharField()
#     role = models.CharField()