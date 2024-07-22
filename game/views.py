import logging
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import Dog, Player, DogType, Game
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import DogSerializer, PlayerSerializer, DogTypeSerializer, GameSerializer

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

class DogTypeViewSet(viewsets.ModelViewSet):
    queryset = DogType.objects.all()
    serializer_class = DogTypeSerializer

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

class DogViewSet(viewsets.ModelViewSet):
    queryset = Dog.objects.all()
    serializer_class = DogSerializer

    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        dog = self.get_object()
        new_x = request.data.get("x")
        new_y = request.data.get("y")

        logger.debug(f"Move request: dog_id={dog.id}, new_x={new_x}, new_y={new_y}")

        if new_x is None or new_y is None:
            return Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_x = int(new_x)
            new_y = int(new_y)
        except ValueError:
            return Response({"error": "Invalid parameters"}, status=status.HTTP_400_BAD_REQUEST)

        dogs_in_game = Dog.objects.filter(game=dog.game)
        xs = [d.x_position for d in dogs_in_game]
        ys = [d.y_position for d in dogs_in_game]

        min_x = min(xs)
        max_x = max(xs)
        min_y = min(ys)
        max_y = max(ys)

        if new_x < min_x - 1 or new_x > max_x + 1 or new_y < min_y - 1 or new_y > max_y + 1:
            return Response({"error": "Invalid move"}, status=status.HTTP_400_BAD_REQUEST)

        dog.x_position = new_x
        dog.y_position = new_y
        dog.save()

        return Response({"success": True})

logger = logging.getLogger(__name__)

def home_view(request):
    return render(request, 'index.html')

def game_view(request, game_id):
    game = get_object_or_404(Game, id=game_id)
    dogs = Dog.objects.filter(game=game)
    dogs_with_position = []
    for dog in dogs:
        dogs_with_position.append({
            'id': dog.id,
            'name': dog.dog_type.name,
            'left': dog.x_position * 100,
            'top': dog.y_position * 100
        })
    context = {
        'game': {
            'id': game.id,
            'current_turn': game.current_turn.id,
            'player1': game.player1.id,
            'player2': game.player2.id,
        },
        'dogs': dogs_with_position,
    }
    return JsonResponse(context)