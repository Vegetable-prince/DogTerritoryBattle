import logging
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Game, Dog, DogType
from ..serializers import GameSerializer

logger = logging.getLogger(__name__)

class GameViewSet(viewsets.ModelViewSet):
    """
    ゲームのCRUD操作を提供するViewSet。
    """
    queryset = Game.objects.all()
    serializer_class = GameSerializer

    def retrieve(self, request, pk=None):
        """
        ゲームの詳細情報を取得するメソッド。
        """
        game = get_object_or_404(Game, pk=pk)
        dogs = Dog.objects.filter(game=game)
        player1_hand_dogs, player2_hand_dogs = [], []
        board_dogs = []

        for dog in dogs:
            dog_data = {
                'id': dog.id,
                'name': dog.dog_type.name,
                'x_position': dog.x_position * 100 if dog.x_position is not None else None,
                'y_position': dog.y_position * 100 if dog.y_position is not None else None,
                'is_in_hand': dog.is_in_hand,
                'dog_type': {
                    'id': dog.dog_type.id,
                    'name': dog.dog_type.name,
                    'movement_type': dog.dog_type.movement_type,
                    'max_steps': dog.dog_type.max_steps
                },
                'player': dog.player.id,
                'movement_type': dog.dog_type.movement_type,
                'max_steps': dog.dog_type.max_steps
            }
            if dog.player == game.player1:
                if dog.is_in_hand:
                    player1_hand_dogs.append(dog_data)
                else:
                    board_dogs.append(dog_data)
            else:
                if dog.is_in_hand:
                    player2_hand_dogs.append(dog_data)
                else:
                    board_dogs.append(dog_data)
        
        context = {
            'game': {
                'id': game.id,
                'current_turn': game.current_turn.id,
                'player1': game.player1.id,
                'player2': game.player2.id,
            },
            'player1_hand_dogs': player1_hand_dogs,
            'player2_hand_dogs': player2_hand_dogs,
            'board_dogs': board_dogs
        }
        return Response(context)
    
    @action(detail=True, methods=['post'], url_path='reset_game')
    def reset_game(self, request, pk=None):
        """
        ゲームの状態を初期化するアクション。
        """
        game = get_object_or_404(Game, pk=pk)

        # ゲーム内のすべての犬を削除
        Dog.objects.filter(game=game).delete()

        # プレイヤーを取得
        player1 = game.player1
        player2 = game.player2

        # 犬種を取得
        boss_dog_type = DogType.objects.get(name='ボス犬')
        normal_dog_type = DogType.objects.get(name='普通の犬')
        hajike_dog_type = DogType.objects.get(name='ハジケ犬')

        # プレイヤー1のボス犬を作成してボード上に配置
        Dog.objects.create(
            game=game,
            player=player1,
            dog_type=boss_dog_type,
            x_position=1,
            y_position=1,
            is_in_hand=False
        )

        # プレイヤー2のボス犬を作成してボード上に配置
        Dog.objects.create(
            game=game,
            player=player2,
            dog_type=boss_dog_type,
            x_position=2,
            y_position=1,
            is_in_hand=False
        )

        # プレイヤー1の手札に犬を追加
        Dog.objects.create(
            game=game,
            player=player1,
            dog_type=normal_dog_type,
            is_in_hand=True
        )
        Dog.objects.create(
            game=game,
            player=player1,
            dog_type=hajike_dog_type,
            is_in_hand=True
        )

        # プレイヤー2の手札に犬を追加
        Dog.objects.create(
            game=game,
            player=player2,
            dog_type=normal_dog_type,
            is_in_hand=True
        )
        Dog.objects.create(
            game=game,
            player=player2,
            dog_type=hajike_dog_type,
            is_in_hand=True
        )

        # ゲームのターンを初期化
        game.current_turn = player1
        game.save()

        return Response({"message": "Game has been reset to initial state."})
    