import logging
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import Dog, Player, DogType, Game
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import DogSerializer, PlayerSerializer, DogTypeSerializer, GameSerializer

logger = logging.getLogger(__name__)

class PlayerViewSet(viewsets.ModelViewSet):
    """
    プレイヤーのCRUD操作を提供するViewSet。
    """
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

class DogTypeViewSet(viewsets.ModelViewSet):
    """
    犬の種類のCRUD操作を提供するViewSet。
    """
    queryset = DogType.objects.all()
    serializer_class = DogTypeSerializer

class GameViewSet(viewsets.ModelViewSet):
    """
    ゲームのCRUD操作を提供するViewSet。
    """
    queryset = Game.objects.all()
    serializer_class = GameSerializer

class DogViewSet(viewsets.ModelViewSet):
    """
    犬のCRUD操作を提供するViewSet。
    """
    queryset = Dog.objects.all()
    serializer_class = DogSerializer

    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        """
        犬を新しい位置に移動するアクション。

        Args:
            request (Request): HTTPリクエストオブジェクト。
            pk (int, optional): 犬のプライマリキー。

        Returns:
            Response: 成功時に犬の情報を含むレスポンス。失敗時にエラーメッセージを含むレスポンス。
        """
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

        dogs_in_game = Dog.objects.filter(game=dog.game, is_in_hand=False)
        xs, ys = [d.x_position for d in dogs_in_game], [d.y_position for d in dogs_in_game]

        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)

        if new_x < min_x - 1 or new_x > max_x + 1 or new_y < min_y - 1 or new_y > max_y + 1:
            return Response({"error": "Invalid move"}, status=status.HTTP_400_BAD_REQUEST)

        dog.x_position = new_x
        dog.y_position = new_y
        dog.is_in_hand = False
        dog.save()

        return Response({"success": True, 'dog': DogSerializer(dog).data})

    @action(detail=True, methods=['post'])
    def remove_from_board(self, request, pk=None):
        """
        ボードから犬を取り除くアクション。

        Args:
            request (Request): HTTPリクエストオブジェクト。
            pk (int, optional): 犬のプライマリキー。

        Returns:
            Response: 成功時に犬の情報を含むレスポンス。失敗時にエラーメッセージを含むレスポンス。
        """
        dog = self.get_object()
        dog.x_position = None
        dog.y_position = None
        dog.is_in_hand = True
        dog.save()
        
        return Response({"success": True, 'dog': DogSerializer(dog).data})

    @action(detail=True, methods=['post'])
    def place_on_board(self, request, pk=None):
        """
        犬をボードに配置するアクション。

        Args:
            request (Request): HTTPリクエストオブジェクト。
            pk (int, optional): 犬のプライマリキー。

        Returns:
            Response: 成功時に犬の情報を含むレスポンス。失敗時にエラーメッセージを含むレスポンス。
        """
        dog = self.get_object()
        new_x = request.data.get("x")
        new_y = request.data.get("y")

        if new_x is None or new_y is None:
            return Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_x = int(new_x)
            new_y = int(new_y)
        except ValueError:
            return Response({"error": "Invalid parameters"}, status=status.HTTP_400_BAD_REQUEST)

        dog.x_position = new_x
        dog.y_position = new_y
        dog.is_in_hand = False
        dog.save()

        return Response({"success": True, 'dog': DogSerializer(dog).data})

def home_view(request):
    """
    ホームページをレンダリングするビュー。

    Args:
        request (HttpRequest): HTTPリクエストオブジェクト。

    Returns:
        HttpResponse: レンダリングされたHTMLを含むレスポンス。
    """
    return render(request, 'index.html')

def game_view(request, game_id):
    """
    指定されたゲームの状態をJSON形式で返すビュー。

    Args:
        request (HttpRequest): HTTPリクエストオブジェクト。
        game_id (int): ゲームのプライマリキー。

    Returns:
        JsonResponse: ゲームの状態を含むJSONレスポンス。
    """
    game = get_object_or_404(Game, id=game_id)
    dogs = Dog.objects.filter(game=game)
    player1_hand_dogs, player2_hand_dogs = [], []

    for dog in dogs:
        dog_data = {
            'id': dog.id,
            'name': dog.dog_type.name,
            'left': dog.x_position * 100 if dog.x_position is not None else None,
            'top': dog.y_position * 100 if dog.y_position is not None else None,
            'is_in_hand': dog.is_in_hand,
            'player': dog.player.id
        }
        if dog.player == game.player1:
            player1_hand_dogs.append(dog_data)
        else:
            player2_hand_dogs.append(dog_data)
    
    context = {
        'game': {
            'id': game.id,
            'current_turn': game.current_turn.id,
            'player1': game.player1.id,
            'player2': game.player2.id,
        },
        'player1_hand_dogs': [dog for dog in player1_hand_dogs if dog['is_in_hand']],
        'player2_hand_dogs': [dog for dog in player2_hand_dogs if dog['is_in_hand']],
        'board_dogs': [dog for dog in player1_hand_dogs + player2_hand_dogs if not dog['is_in_hand']]
    }
    return JsonResponse(context)
