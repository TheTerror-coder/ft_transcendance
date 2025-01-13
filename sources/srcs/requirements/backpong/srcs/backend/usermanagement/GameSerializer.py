from rest_framework import serializers
from .models import Game

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['player', 'opponent', 'player_score', 'opponent_score', 'date']
