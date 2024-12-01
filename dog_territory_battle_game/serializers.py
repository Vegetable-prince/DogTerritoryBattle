from rest_framework import serializers
from .models import Dog, Player, DogType, Game


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ["id"]


class DogTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DogType
        fields = ["id", "name", "movement_type", "max_steps"]


class GameSerializer(serializers.ModelSerializer):
    player1 = PlayerSerializer()
    player2 = PlayerSerializer()
    current_turn = PlayerSerializer()
    winner = PlayerSerializer()

    class Meta:
        model = Game
        fields = [
            "id",
            "player1",
            "player2",
            "current_turn",
            "winner",
            "created_at",
            "updated_at",
            "deleted_at",
        ]


class DogSerializer(serializers.ModelSerializer):
    player = serializers.PrimaryKeyRelatedField(read_only=True)
    name = serializers.CharField(source="dog_type.name")
    movement_type = serializers.CharField(source="dog_type.movement_type")
    max_steps = serializers.IntegerField(source="dog_type.max_steps")

    class Meta:
        model = Dog
        fields = [
            "id",
            "player",
            "name",
            "movement_type",
            "max_steps",
            "x_position",
            "y_position",
        ]
