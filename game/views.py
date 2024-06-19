import logging

from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import Game, Dog
from rest_framework import viewsets
from .serializers import DogSerializer

class DogViewSet(viewsets.ModelViewSet):
    queryset = Dog.objects.all()
    serializer_class = DogSerializer

# ログの設定
logger = logging.getLogger(__name__)

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
        'game': game,
        'dogs': dogs_with_position,
    }
    return render(request, 'game/index.html', context)

def move_dog(request):
    if request.method == "POST":
        logger.debug("Request POST data: %s", request.POST)
        logger.debug("Request user: %s", request.user)

        dog_id = request.POST.get("dog_id")
        new_x = request.POST.get("x")
        new_y = request.POST.get("y")

        # デバッグ用のチェック
        if not dog_id or not new_x or not new_y:
            logger.error("Missing parameters: dog_id=%s, x=%s, y=%s", dog_id, new_x, new_y)
            return JsonResponse({"error": "Missing parameters"}, status=400)

        try:
            new_x = int(new_x)
            new_y = int(new_y)
        except ValueError:
            logger.error("Invalid parameters: x=%s, y=%s", new_x, new_y)
            return JsonResponse({"error": "Invalid parameters"}, status=400)

        dog = get_object_or_404(Dog, id=dog_id)
        game = dog.game

        # Check move validity (simplified for the example)
        if new_x < 0 or new_x > 3 or new_y < 0 or new_y > 3:
            logger.error("Invalid move: x=%s, y=%s (must be between 0 and 3)", new_x, new_y)
            return JsonResponse({"error": "Invalid move"}, status=400)

        dog.x_position = new_x
        dog.y_position = new_y
        dog.save()

        # Switch turns
        game.current_turn = game.player1 if game.current_turn == game.player2 else game.player2
        game.save()

        return JsonResponse({"success": True})

    logger.error("Invalid request method: %s", request.method)
    return JsonResponse({"error": "Invalid request method"}, status=400)