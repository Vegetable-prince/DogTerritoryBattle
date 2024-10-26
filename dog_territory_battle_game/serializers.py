from rest_framework import serializers
from .models import Dog, Player, DogType, Game

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'user', 'created_at', 'updated_at', 'deleted_at']

class DogTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DogType
        fields = ['id', 'name', 'movement_type', 'max_steps', 'created_at', 'updated_at', 'deleted_at']

class GameSerializer(serializers.ModelSerializer):
    player1 = PlayerSerializer()
    player2 = PlayerSerializer()
    current_turn = PlayerSerializer()
    winner = PlayerSerializer()

    class Meta:
        model = Game
        fields = ['id', 'player1', 'player2', 'current_turn', 'winner', 'created_at', 'updated_at', 'deleted_at']

class DogSerializer(serializers.ModelSerializer):
    player = PlayerSerializer()
    dog_type = DogTypeSerializer()
    game = GameSerializer()

    class Meta:
        model = Dog
        fields = ['id', 'game', 'player', 'dog_type', 'x_position', 'y_position', 'created_at', 'updated_at', 'deleted_at']
