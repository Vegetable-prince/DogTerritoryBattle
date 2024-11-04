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

    def retrieve(self, request, pk=None):
        """
        ゲームの詳細情報を取得するメソッド。

        Args:
            request (Request): HTTPリクエストオブジェクト。
            pk (int, optional): ゲームのプライマリキー。

        Returns:
            Response: ゲームの詳細情報を含むレスポンス。
        """
        game = get_object_or_404(Game, pk=pk)
        dogs = Dog.objects.filter(game=game)
        player1_hand_dogs, player2_hand_dogs = [], []

        for dog in dogs:
            dog_data = {
                'id': dog.id,
                'name': dog.dog_type.name,
                'left': dog.x_position * 100 if dog.x_position is not None else None,
                'top': dog.y_position * 100 if dog.y_position is not None else None,
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
                    player1_hand_dogs.append(dog_data)
            else:
                if dog.is_in_hand:
                    player2_hand_dogs.append(dog_data)
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
        return Response(context)
    
    @action(detail=True, methods=['post'], url_path='reset_game')
    def reset_game(self, request, pk=None):
        """
        ゲームの状態を初期化するアクション。

        Args:
            request (Request): HTTPリクエストオブジェクト。
            pk (int, optional): ゲームのプライマリキー。

        Returns:
            Response: 成功時にメッセージを含むレスポンス。
        """
        game = get_object_or_404(Game, pk=pk)

        # ゲーム内のすべての犬を削除
        Dog.objects.filter(game=game).delete()

        # プレイヤーを取得
        player1 = game.player1
        player2 = game.player2

        # 犬種を取得
        boss_dog_type = DogType.objects.get(name='ボス犬')
        # 他の犬種も取得（例として "普通の犬" と "ハジケ犬" とします）
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

class DogViewSet(viewsets.ModelViewSet):
    """
    犬のCRUD操作を提供するViewSet。
    """
    queryset = Dog.objects.all()
    serializer_class = DogSerializer

    def update_current_turn(self, game):
        """
        ゲームのcurrent_turnを更新するヘルパーメソッド。
        """
        if game.current_turn == game.player1:
            game.current_turn = game.player2
        else:
            game.current_turn = game.player1
        game.save()
        return game.current_turn.id

    @action(detail=True, methods=['post'], url_path='move', url_name='move')
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
        if dog.game.current_turn != dog.player:
            return Response({"error": "まだあなたのターンではありません！"}, status=status.HTTP_400_BAD_REQUEST)
        
        new_x = request.data.get("x")
        new_y = request.data.get("y")

        logger.debug(f"moveメソッドの移動先: dog_id={dog.id}, new_x={new_x}, new_y={new_y}")

        if new_x is None or new_y is None:
            return Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_x = int(new_x)
            new_y = int(new_y)
        except ValueError:
            return Response({"error": "Invalid parameters"}, status=status.HTTP_400_BAD_REQUEST)

        # フィールドサイズのチェックを先に行う
        dogs_in_game = Dog.objects.filter(game=dog.game, is_in_hand=False).exclude(id=dog.id)
        xs, ys = [d.x_position for d in dogs_in_game], [d.y_position for d in dogs_in_game]

        min_x, max_x = min(xs + [new_x]), max(xs + [new_x])
        min_y, max_y = min(ys + [new_y]), max(ys + [new_y])

        if max_x - min_x >= 4 or max_y - min_y >= 4:
            return Response({"error": "フィールドのサイズを超えるため移動できません。"}, status=status.HTTP_400_BAD_REQUEST)

        # 移動の有効性をチェック
        if not self.is_valid_move(dog, new_x, new_y):
            logger.debug("is_valid_moveによる判定にて無効な移動")
            return Response({"error": "この犬種では無効な移動です。"}, status=status.HTTP_400_BAD_REQUEST)
        
        # 移動先に他のコマがあるかチェック
        if Dog.objects.filter(game=dog.game, x_position=new_x, y_position=new_y, is_in_hand=False).exists():
            logger.debug("すでにコマが存在しているマスに移動しています")
            return Response({"error": "そのマスには既にコマがあります。"}, status=status.HTTP_400_BAD_REQUEST)

        # 移動後に他のコマと隣接しているかチェック
        if not self.is_adjacent_to_other_dogs(dog.game, new_x, new_y, exclude_dog_id=dog.id):
            logger.debug("is_adjacent_to_other_dogsによる判定にて無効な移動")
            return Response({"error": "他のコマと隣接していない場所には移動できません。"}, status=status.HTTP_400_BAD_REQUEST)

        # 元の位置を保存
        original_x, original_y = dog.x_position, dog.y_position

        # コマを新しい位置に移動
        dog.x_position = new_x
        dog.y_position = new_y
        dog.is_in_hand = False

        # 自分のボス犬が囲まれるかチェック
        if self.would_cause_self_loss(dog.game, dog.player):
            # 元の位置に戻す
            dog.x_position = original_x
            dog.y_position = original_y
            return Response({"error": "この移動はあなたのボス犬が囲まれるため、移動できません。"}, status=status.HTTP_400_BAD_REQUEST)

        # コマの新しい位置を保存
        dog.save()

        # 勝敗の判定
        winner = self.check_winner(dog.game)
        if winner:
            logger.debug(f"Winner determined: {winner.user.username}")
            game = dog.game
            game.winner = winner
            game.save()
            return Response({"success": True, 'dog': DogSerializer(dog).data, 'winner': winner.user.username})

        new_turn_id = self.update_current_turn(dog.game)
        return Response({
            "success": True,
            'dog': DogSerializer(dog).data,
            'current_turn': new_turn_id
        })

    def is_valid_move(self, dog, new_x, new_y):
        """
        指定した移動先のマスがゲームルールに従っているかどうかを確認するメソッド。

        Args:
            dog (Dog): 移動させる犬のオブジェクト。
            new_x (int): 移動先マスのx座標。
            new_y (int): 移動先マスのy座標。

        Returns:
            bool: 移動が有効である場合はTrue、無効である場合はFalseを返す。
        """
        logger.debug(f"is_valid_moveにて移動が適切かどうか判定開始 dog_id={dog.id}, new_x={new_x}, new_y={new_y}")
        movement_type = dog.dog_type.movement_type
        max_steps = dog.dog_type.max_steps

        dx = new_x - dog.x_position
        dy = new_y - dog.y_position

        abs_dx = abs(dx)
        abs_dy = abs(dy)

        logger.debug(f"dx={dx}, dy={dy}, abs_dx={abs_dx}, abs_dy={abs_dy}, movement_type={movement_type}")

        if movement_type == 'diagonal_orthogonal':
            valid = max(abs_dx, abs_dy) == 1 and (abs_dx != 0 or abs_dy != 0)
            logger.debug(f"有効な縦横斜め移動: {valid}")
            return valid
        elif movement_type == 'orthogonal':
            if max_steps is None:
                valid = (dx == 0 or dy == 0) and (abs_dx + abs_dy != 0)
                logger.debug(f"有効な縦横無制限移動: {valid}")
                return valid
            else:
                valid = ((abs_dx == 1 and dy == 0) or (dx == 0 and abs_dy == 1))
                logger.debug(f"有効な縦横一マス移動: {valid}")
                return valid
        elif movement_type == 'diagonal':
            valid = abs_dx == 1 and abs_dy == 1
            logger.debug(f"有効な斜め移動: {valid}")
            return valid
        elif movement_type == 'special_hajike':
            # ハジケ犬の特殊な移動
            if (abs_dx == 2 and abs_dy == 1) or (abs_dx == 1 and abs_dy == 2):
                valid = True
            else:
                valid = False
            logger.debug(f"無効なL字移動: {valid}")
            return valid
        else:
            logger.debug("そのような移動パターンはありません。")
            return False
    
    def is_adjacent_to_other_dogs(self, game, x, y, exclude_dog_id=None, own_pieces_only=False, player=None):
        logger.debug(f"is_adjacent_to_other_dogs called with x={x}, y={y}, exclude_dog_id={exclude_dog_id}")
        adjacent_positions = [
            (x - 1, y - 1), (x, y - 1), (x + 1, y - 1),
            (x - 1, y),               (x + 1, y),
            (x - 1, y + 1), (x, y + 1), (x + 1, y + 1),
        ]
        other_dogs = Dog.objects.filter(game=game, is_in_hand=False).exclude(id=exclude_dog_id)
        if own_pieces_only and player:
            other_dogs = other_dogs.filter(player=player)
        for dog in other_dogs:
            logger.debug(f"Checking adjacency with dog_id={dog.id} at position ({dog.x_position}, {dog.y_position})")
            if (dog.x_position, dog.y_position) in adjacent_positions:
                logger.debug("Adjacent dog found")
                return True
        logger.debug("No adjacent dogs found")
        return False

    def check_winner(self, game):
        """
        ボス犬が囲まれているかをチェックし、勝者を判定するメソッド。

        Args:
            game (Game): ゲームオブジェクト。

        Returns:
            Player: 勝者のプレイヤーオブジェクト。勝者がいない場合はNoneを返す。
        """
        logger.debug(f"check_winner called for game_id={game.id}")
        boss_dogs = Dog.objects.filter(game=game, dog_type__name='ボス犬')
        for boss in boss_dogs:
            logger.debug(f"Checking boss dog_id={boss.id} for player {boss.player.user.username}")
            x, y = boss.x_position, boss.y_position
            adjacent_positions = [
                (x, y - 1),
                (x, y + 1),
                (x - 1, y),
                (x + 1, y)
            ]
            blocked = True
            for pos in adjacent_positions:
                logger.debug(f"Checking position {pos}")
                # フィールドのサイズを考慮
                if not self.is_within_field(game, pos[0], pos[1]):
                    logger.debug(f"Position {pos} is outside the field")
                    continue
                if not Dog.objects.filter(game=game, x_position=pos[0], y_position=pos[1]).exists():
                    logger.debug(f"Position {pos} is empty; boss dog is not blocked")
                    blocked = False
                    break
            if blocked:
                winner = game.player2 if boss.player == game.player1 else game.player1
                logger.debug(f"Boss dog_id={boss.id} is blocked; winner is {winner.user.username}")
                return winner
        logger.debug("No winner found")
        return None
    
    def is_within_field(self, game, new_x, new_y):
        """
        指定された新しい座標がフィールド内に収まっているかを判定するメソッド。

        Args:
            game (Game): ゲームオブジェクト。
            new_x (int): 移動先または配置先のx座標。
            new_y (int): 移動先または配置先のy座標。

        Returns:
            bool: フィールド内に収まっていればTrue、そうでなければFalse。
        """
        FIELD_MAX_SIZE = 4  # フィールドの最大サイズ（縦横）

        # 現在のフィールドの最小・最大x, y座標を取得
        dogs_in_game = Dog.objects.filter(game=game, is_in_hand=False)
        if dogs_in_game.exists():
            current_min_x = min(dog.x_position for dog in dogs_in_game)
            current_max_x = max(dog.x_position for dog in dogs_in_game)
            current_min_y = min(dog.y_position for dog in dogs_in_game)
            current_max_y = max(dog.y_position for dog in dogs_in_game)
        else:
            # 初期配置の場合、フィールドサイズを1とする
            current_min_x = new_x
            current_max_x = new_x
            current_min_y = new_y
            current_max_y = new_y

        # 新しい座標を含めた場合の最小・最大x, yを計算
        new_min_x = min(current_min_x, new_x)
        new_max_x = max(current_max_x, new_x)
        new_min_y = min(current_min_y, new_y)
        new_max_y = max(current_max_y, new_y)

        # フィールドサイズが4マス以内かを判定
        if (new_max_x - new_min_x + 1) > FIELD_MAX_SIZE or (new_max_y - new_min_y + 1) > FIELD_MAX_SIZE:
            return False

        return True

    @action(detail=True, methods=['post'], url_path='remove_from_board', url_name='remove_from_board')
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
        logger.debug(f"remove_from_board called for dog_id={dog.id}")
        if dog.game.current_turn != dog.player:
            logger.debug("Not the player's turn")
            return Response({"error": "まだあなたのターンではありません！"}, status=status.HTTP_400_BAD_REQUEST)

        if dog.dog_type.name == 'ボス犬':
            logger.debug("Attempted to remove Boss Dog")
            return Response({"error": "ボス犬は手札に戻せません。"}, status=status.HTTP_400_BAD_REQUEST)

        # コマを手札に戻した後に、他のコマが孤立するかチェック
        if not self.can_remove_dog(dog):
            logger.debug("Cannot remove dog; it would isolate other pieces")
            return Response({"error": "このコマを手札に戻すと、他のコマが孤立します。"}, status=status.HTTP_400_BAD_REQUEST)

        dog.x_position = None
        dog.y_position = None
        dog.is_in_hand = True
        dog.save()
        logger.debug(f"Dog_id={dog.id} removed from board")

        new_turn_id = self.update_current_turn(dog.game)
        return Response({
            "success": True,
            'dog': DogSerializer(dog).data,
            'current_turn': new_turn_id
        })
    
    def can_remove_dog(self, dog):
        logger.debug(f"can_remove_dog called for dog_id={dog.id}")
        # 仮にコマを取り除いた場合に、他のコマが孤立しないかをチェックする

        # 取り除くコマを除いたボード上のコマを取得
        remaining_dogs = Dog.objects.filter(game=dog.game, is_in_hand=False).exclude(id=dog.id)

        # ボード上に他のコマがなければ問題なく取り除ける
        if not remaining_dogs.exists():
            logger.debug("No other dogs on the board; can remove dog.")
            return True

        # 各コマが孤立していないかチェック
        for other_dog in remaining_dogs:
            if not self.has_adjacent_dog(other_dog, remaining_dogs):
                logger.debug(f"Dog_id={other_dog.id} would be isolated after removal.")
                return False  # 孤立するコマがあるため、取り除けない
        logger.debug(f"All dogs remain connected after removing dog_id={dog.id}")
        return True  # 全てのコマが孤立しないため、取り除ける
    
    def has_adjacent_dog(self, dog, dog_queryset):
        """
        指定したコマが周囲8方向に他のコマと隣接しているかを判定する。

        Args:
            dog (Dog): 判定対象のコマ。
            dog_queryset (QuerySet): チェック対象のコマのクエリセット。

        Returns:
            bool: 隣接するコマが存在する場合は True、存在しない場合は False。
        """
        x, y = dog.x_position, dog.y_position
        adjacent_positions = [
            (x - 1, y - 1), (x, y - 1), (x + 1, y - 1),
            (x - 1, y),               (x + 1, y),
            (x - 1, y + 1), (x, y + 1), (x + 1, y + 1),
        ]
        for adj_dog in dog_queryset:
            if adj_dog.id != dog.id and (adj_dog.x_position, adj_dog.y_position) in adjacent_positions:
                return True  # 隣接するコマが見つかった
        return False  # 隣接するコマがない（孤立している）

    @action(detail=True, methods=['post'], url_path='place_on_board', url_name='place_on_board')
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
        logger.debug(f"place_on_board called for dog_id={dog.id}")
        if dog.game.current_turn != dog.player:
            logger.debug("Not the player's turn")
            return Response({"error": "まだあなたのターンではありません！"}, status=status.HTTP_400_BAD_REQUEST)

        new_x = request.data.get("x")
        new_y = request.data.get("y")
        logger.debug(f"Requested position: x={new_x}, y={new_y}")

        if new_x is None or new_y is None:
            logger.debug("Missing parameters")
            return Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_x = int(new_x)
            new_y = int(new_y)
        except ValueError:
            logger.debug("Invalid parameters")
            return Response({"error": "Invalid parameters"}, status=status.HTTP_400_BAD_REQUEST)

        dogs_in_game = Dog.objects.filter(game=dog.game, is_in_hand=False)
        xs, ys = [d.x_position for d in dogs_in_game] + [new_x], [d.y_position for d in dogs_in_game] + [new_y]

        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        logger.debug(f"Field bounds after placement: x({min_x}-{max_x}), y({min_y}-{max_y})")

        if max_x - min_x >= 4 or max_y - min_y >= 4:
            logger.debug("Field size exceeded")
            return Response({"error": "フィールドのサイズを超えるため移動できません。"}, status=status.HTTP_400_BAD_REQUEST)

        # 配置先に他のコマがあるかチェック
        if Dog.objects.filter(game=dog.game, x_position=new_x, y_position=new_y, is_in_hand=False).exists():
            logger.debug("Target square is occupied")
            return Response({"error": "そのマスには既にコマがあります。"}, status=status.HTTP_400_BAD_REQUEST)

        # 配置後に他のコマと隣接しているかチェック
        if dogs_in_game.exists() and not self.is_adjacent_to_other_dogs(
            dog.game, new_x, new_y, own_pieces_only=True, player=dog.player):
            logger.debug("Not adjacent to other dogs after placement")
            return Response({"error": "他のコマと隣接していない場所には配置できません。"}, status=status.HTTP_400_BAD_REQUEST)

        # 元の状態を保存
        original_x, original_y = dog.x_position, dog.y_position
        original_in_hand = dog.is_in_hand

        # コマを新しい位置に配置
        dog.x_position = new_x
        dog.y_position = new_y
        dog.is_in_hand = False

        # 自分のボス犬が囲まれるかチェック
        if self.would_cause_self_loss(dog.game, dog.player):
            # 元の状態に戻す
            dog.x_position = original_x
            dog.y_position = original_y
            dog.is_in_hand = original_in_hand
            return Response({"error": "この配置はあなたのボス犬が囲まれるため、配置できません。"}, status=status.HTTP_400_BAD_REQUEST)

        dog.save()
        logger.debug(f"Dog placed on board at ({new_x}, {new_y})")

        # 勝敗の判定
        winner = self.check_winner(dog.game)
        if winner:
            logger.debug(f"Winner determined: {winner.user.username}")
            game = dog.game
            game.winner = winner
            game.save()
            return Response({"success": True, 'dog': DogSerializer(dog).data, 'winner': winner.user.username})

        new_turn_id = self.update_current_turn(dog.game)
        return Response({
            "success": True,
            'dog': DogSerializer(dog).data,
            'current_turn': new_turn_id
        })
    
    def would_cause_self_loss(self, game, player):
        """
        プレイヤーのボス犬が囲まれているかをチェックするメソッド。

        Args:
            game (Game): ゲームオブジェクト。
            player (Player): チェック対象のプレイヤー。

        Returns:
            bool: ボス犬が囲まれている場合は True、そうでない場合は False。
        """
        boss_dog = Dog.objects.filter(game=game, player=player, dog_type__name='ボス犬').first()
        if not boss_dog:
            return False  # ボス犬が存在しない場合、安全策として False を返す

        x, y = boss_dog.x_position, boss_dog.y_position
        adjacent_positions = [
            (x, y - 1),
            (x, y + 1),
            (x - 1, y),
            (x + 1, y)
        ]

        for pos in adjacent_positions:
            if not self.is_within_field(game, pos[0], pos[1]):
                continue
            if not Dog.objects.filter(game=game, x_position=pos[0], y_position=pos[1]).exists():
                return False  # ボス犬は囲まれていない
        return True  # ボス犬は囲まれている

def home_view(request):
    """
    ホームページをレンダリングするビュー。

    Args:
        request (HttpRequest): HTTPリクエストオブジェクト。

    Returns:
        HttpResponse: レンダリングされたHTMLを含むレスポンス。
    """
    return render(request, 'index.html')
