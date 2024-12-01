import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Dog
from ..serializers import DogSerializer
from ..views.utils import (
    update_current_turn,
    get_new_coordinates,
    is_within_field_after_move,
    is_valid_move,
    is_square_occupied,
    is_adjacent_after_move,
    is_adjacent_after_place,
    would_cause_self_loss,
    check_winner,
    declare_winner,
    can_remove_dog,
    save_original_position,
    save_original_state,
    restore_original_position,
    restore_original_state,
)

logger = logging.getLogger(__name__)


class DogViewSet(viewsets.ModelViewSet):
    """
    犬のCRUD操作を提供するViewSet。
    """

    queryset = Dog.objects.all()
    serializer_class = DogSerializer

    def is_player_turn_func(self, dog):
        """
        現在のターンが指定されたプレイヤーのターンかを判定する。
        """
        return dog.game.current_turn == dog.player

    @action(detail=True, methods=["post"], url_path="move", url_name="move")
    def move(self, request, pk=None):
        """
        犬を新しい位置に移動するアクション。
        """
        dog = self.get_object()
        if not self.is_player_turn_func(dog):
            return Response(
                {"error": "まだあなたのターンではありません！"}, status=status.HTTP_400_BAD_REQUEST
            )

        new_x, new_y, error_response = get_new_coordinates(request)
        if error_response:
            return error_response

        if not is_within_field_after_move(dog.game, new_x, new_y, dog.id):
            return Response(
                {"error": "フィールドのサイズを超えるため移動できません。"}, status=status.HTTP_400_BAD_REQUEST
            )

        if not is_valid_move(dog, new_x, new_y):
            return Response(
                {"error": "この犬種では無効な移動です。"}, status=status.HTTP_400_BAD_REQUEST
            )

        if is_square_occupied(dog.game, new_x, new_y):
            return Response(
                {"error": "そのマスには既にコマがあります。"}, status=status.HTTP_400_BAD_REQUEST
            )

        if not is_adjacent_after_move(dog.game, new_x, new_y, dog.id):
            return Response(
                {"error": "他のコマと隣接していない場所には移動できません。"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        original_position = save_original_position(dog)

        # 犬の位置を更新
        dog.x_position = new_x
        dog.y_position = new_y
        dog.is_in_hand = False
        dog.save()

        if would_cause_self_loss(dog.game, dog.player):
            restore_original_position(dog, original_position)
            dog.save()
            return Response(
                {"error": "この移動はあなたのボス犬が囲まれるため、移動できません。"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        winner = check_winner(dog.game)
        if winner:
            declare_winner(dog.game, winner)
            return Response(
                {
                    "success": True,
                    "dog": DogSerializer(dog).data,
                    "winner": winner.user.username,
                }
            )

        new_turn_id = update_current_turn(dog.game)
        return Response(
            {
                "success": True,
                "dog": DogSerializer(dog).data,
                "current_turn": new_turn_id,
            }
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="remove_from_board",
        url_name="remove_from_board",
    )
    def remove_from_board(self, request, pk=None):
        """
        ボードから犬を取り除くアクション。
        """
        dog = self.get_object()
        if not self.is_player_turn_func(dog):
            return Response(
                {"error": "まだあなたのターンではありません！"}, status=status.HTTP_400_BAD_REQUEST
            )

        if dog.dog_type.name == "ボス犬":
            return Response(
                {"error": "ボス犬は手札に戻せません。"}, status=status.HTTP_400_BAD_REQUEST
            )

        if not can_remove_dog(dog):
            return Response(
                {"error": "このコマを手札に戻すと、他のコマが孤立します。"}, status=status.HTTP_400_BAD_REQUEST
            )

        # コマを手札に戻す処理
        dog.x_position = None
        dog.y_position = None
        dog.is_in_hand = True
        dog.save()

        new_turn_id = update_current_turn(dog.game)
        return Response(
            {
                "success": True,
                "dog": DogSerializer(dog).data,
                "current_turn": new_turn_id,
            }
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="place_on_board",
        url_name="place_on_board",
    )
    def place_on_board(self, request, pk=None):
        """
        犬をボードに配置するアクション。
        """
        dog = self.get_object()
        if not self.is_player_turn_func(dog):
            return Response(
                {"error": "まだあなたのターンではありません！"}, status=status.HTTP_400_BAD_REQUEST
            )

        new_x, new_y, error_response = get_new_coordinates(request)
        if error_response:
            return error_response

        if not is_within_field_after_move(dog.game, new_x, new_y, dog.id):
            return Response(
                {"error": "フィールドのサイズを超えるため配置できません。"}, status=status.HTTP_400_BAD_REQUEST
            )

        if is_square_occupied(dog.game, new_x, new_y):
            return Response(
                {"error": "そのマスには既にコマがあります。"}, status=status.HTTP_400_BAD_REQUEST
            )

        if not is_adjacent_after_place(dog.game, new_x, new_y, dog):
            return Response(
                {"error": "他のコマと隣接していない場所には配置できません。"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        original_state = save_original_state(dog)

        # 犬の位置を更新
        dog.x_position = new_x
        dog.y_position = new_y
        dog.is_in_hand = False
        dog.save()  # ここで保存する

        if would_cause_self_loss(dog.game, dog.player):
            restore_original_state(dog, original_state)
            dog.save()
            return Response(
                {"error": "この配置はあなたのボス犬が囲まれるため、配置できません。"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        winner = check_winner(dog.game)
        if winner:
            declare_winner(dog.game, winner)
            return Response(
                {
                    "success": True,
                    "dog": DogSerializer(dog).data,
                    "winner": winner.user.username,
                }
            )

        new_turn_id = update_current_turn(dog.game)
        return Response(
            {
                "success": True,
                "dog": DogSerializer(dog).data,
                "current_turn": new_turn_id,
            }
        )
