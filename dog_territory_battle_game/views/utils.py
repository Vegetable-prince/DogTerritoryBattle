from ..models import Dog
import logging
from django.db import models
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

# フィールドの定数
FIELD_MIN_X = 0
FIELD_MAX_X = 3
FIELD_MIN_Y = 0
FIELD_MAX_Y = 3
FIELD_MAX_SIZE = 4  # フィールドの最大サイズ（縦横）

def update_current_turn(game):
    """
    ゲームのcurrent_turnを更新するヘルパーメソッド。
    """
    if game.current_turn == game.player1:
        game.current_turn = game.player2
    else:
        game.current_turn = game.player1
    game.save()
    return game.current_turn.id

def is_position_within_field(x, y):
    """
    指定された座標がフィールド内にあるかどうかを確認します。
    フィールドサイズが4x4の場合、0から3の範囲内です。
    """
    return FIELD_MIN_X <= x <= FIELD_MAX_X and FIELD_MIN_Y <= y <= FIELD_MAX_Y

def is_field_at_max_size(game):
    """
    現在のゲームのフィールドサイズが最大サイズに達しているかを判定します。
    """
    dogs_in_game = Dog.objects.filter(game=game, is_in_hand=False)
    if not dogs_in_game.exists():
        return False

    min_x = dogs_in_game.aggregate(min_x=models.Min('x_position'))['min_x']
    max_x = dogs_in_game.aggregate(max_x=models.Max('x_position'))['max_x']
    min_y = dogs_in_game.aggregate(min_y=models.Min('y_position'))['min_y']
    max_y = dogs_in_game.aggregate(max_y=models.Max('y_position'))['max_y']

    field_width = max_x - min_x + 1
    field_height = max_y - min_y + 1

    return field_width >= FIELD_MAX_SIZE or field_height >= FIELD_MAX_SIZE

def would_cause_self_loss(game, player):
    """
    プレイヤーのボス犬が囲まれているかをチェックするメソッド。
    各方向ごとにフィールドが最大サイズに達しているかを判定し、枠線によるブロックを適用します。
    """
    boss_dog = Dog.objects.filter(game=game, player=player, dog_type__name='ボス犬').first()
    if not boss_dog:
        logger.debug("ボス犬が存在しません。")
        return False  # ボス犬が存在しない場合、安全策として False を返す

    x, y = boss_dog.x_position, boss_dog.y_position

    # 現在のフィールドの最小・最大座標を取得
    dogs_in_game = Dog.objects.filter(game=game, is_in_hand=False)

    logger.debug(f"ボード上の全コマの位置は{dogs_in_game}")

    if not dogs_in_game.exists():
        logger.debug("ゲーム内に犬が存在しません。")
        return False

    min_x = dogs_in_game.aggregate(min_x=models.Min('x_position'))['min_x']
    max_x = dogs_in_game.aggregate(max_x=models.Max('x_position'))['max_x']
    min_y = dogs_in_game.aggregate(min_y=models.Min('y_position'))['min_y']
    max_y = dogs_in_game.aggregate(max_y=models.Max('y_position'))['max_y']

    field_width = max_x - min_x + 1
    field_height = max_y - min_y + 1

    logger.debug(f"Field dimensions: width={field_width}, height={field_height}")
    logger.debug(f"Field bounds: x={min_x} to {max_x}, y={min_y} to {max_y}")

    # 各方向ごとのブロック判定
    directions = {
        'up': (x, y - 1),
        'down': (x, y + 1),
        'left': (x - 1, y),
        'right': (x + 1, y)
    }

    blocked_directions = 0

    for direction, pos in directions.items():
        logger.debug(f"Checking direction: {direction}, position: {pos}")

        if direction in ['up', 'down']:
            # 縦方向のフィールドサイズが最大かどうかを判定
            if field_height >= FIELD_MAX_SIZE:
                if (direction == 'up' and y == min_y) or (direction == 'down' and y == max_y):
                    logger.debug(f"{direction}方向はフィールドが最大サイズで、ボス犬が端に位置しています。ブロックとみなします。")
                    blocked_directions += 1
                    continue

        if direction in ['left', 'right']:
            # 横方向のフィールドサイズが最大かどうかを判定
            if field_width >= FIELD_MAX_SIZE:
                if (direction == 'left' and x == min_x) or (direction == 'right' and x == max_x):
                    logger.debug(f"{direction}方向はフィールドが最大サイズで、ボス犬が端に位置しています。ブロックとみなします。")
                    blocked_directions += 1
                    continue

        # フィールドが最大サイズでなく、かつボス犬が端にいない場合、隣接位置に犬がいるか確認
        if is_position_within_field(pos[0], pos[1]):
            if Dog.objects.filter(game=game, x_position=pos[0], y_position=pos[1], is_in_hand=False).exists():
                logger.debug(f"{direction}方向に犬が存在します。ブロックとみなします。")
                blocked_directions += 1
            else:
                logger.debug(f"{direction}方向には犬が存在しません。ブロックされていません。")
        else:
            # フィールドが最大サイズでない場合、フィールド外はブロックとみなさない
            logger.debug(f"{direction}方向はフィールド外ですが、フィールドが最大サイズに達していないため、ブロックされていません。")

    logger.debug(f"Blocked directions count: {blocked_directions}")

    # ボス犬がすべての方向でブロックされているか判定
    if blocked_directions >= 4:
        logger.debug("Boss dog is surrounded.")
        return True  # すべての方向でブロックされている
    else:
        logger.debug("Boss dog is not surrounded.")
        return False  # 一部の方向でブロックされていない

def check_winner(game):
    """
    ボス犬が囲まれているかをチェックし、勝者を判定するメソッド。
    """
    boss_dogs = Dog.objects.filter(game=game, dog_type__name='ボス犬')
    for boss in boss_dogs:
        if would_cause_self_loss(game, boss.player):
            winner = game.player2 if boss.player == game.player1 else game.player1
            game.winner = winner
            game.save()
            logger.debug(f"Winner determined: プレイヤー{winner.id}")
            return winner
    return None

def declare_winner(game, winner):
    """
    勝者をゲームに設定する。
    """
    game.winner = winner
    game.save()

def can_remove_dog(dog):
    """
    コマを手札に戻した後に他のコマが孤立しないかをチェックするメソッド。
    """
    remaining_dogs = Dog.objects.filter(game=dog.game, is_in_hand=False).exclude(id=dog.id)

    if not remaining_dogs.exists():
        return True

    for other_dog in remaining_dogs:
        if not has_adjacent_dog(other_dog, remaining_dogs):
            return False
    return True

def has_adjacent_dog(dog, dog_queryset):
    """
    指定したコマが周囲8方向に他のコマと隣接しているかを判定する。
    """
    x, y = dog.x_position, dog.y_position
    adjacent_positions = [
        (x - 1, y - 1), (x, y - 1), (x + 1, y - 1),
        (x - 1, y),               (x + 1, y),
        (x - 1, y + 1), (x, y + 1), (x + 1, y + 1),
    ]
    for adj_dog in dog_queryset:
        if (adj_dog.x_position, adj_dog.y_position) in adjacent_positions:
            return True
    return False

def get_new_coordinates(request):
    """
    リクエストから新しい座標を取得し、検証する。
    """
    new_x = request.data.get("x")
    new_y = request.data.get("y")

    if new_x is None or new_y is None:
        return None, None, Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        new_x = int(new_x)
        new_y = int(new_y)
    except ValueError:
        return None, None, Response({"error": "Invalid parameters"}, status=status.HTTP_400_BAD_REQUEST)

    return new_x, new_y, None

def is_within_field_after_move(game, new_x, new_y, moving_dog_id):
    """
    移動後のフィールドサイズが許容範囲内かを判定する。
    """
    dogs_in_game = Dog.objects.filter(game=game, is_in_hand=False).exclude(id=moving_dog_id)
    xs = [d.x_position for d in dogs_in_game] + [new_x]
    ys = [d.y_position for d in dogs_in_game] + [new_y]

    min_x = min(xs)
    max_x = max(xs)
    min_y = min(ys)
    max_y = max(ys)

    return (max_x - min_x + 1) <= FIELD_MAX_SIZE and (max_y - min_y + 1) <= FIELD_MAX_SIZE

def is_valid_move(dog, new_x, new_y):
    """
    指定した移動先のマスがゲームルールに従っているかどうかを確認するメソッド。
    """
    movement_type = dog.dog_type.movement_type
    max_steps = dog.dog_type.max_steps

    dx = new_x - dog.x_position
    dy = new_y - dog.y_position

    abs_dx = abs(dx)
    abs_dy = abs(dy)

    if movement_type == 'diagonal_orthogonal':
        logger.debug(f"is_valid_moveメソッド: {dog}の動きは{movement_type}で最大歩数が{max_steps}で最新の移動先が{dx}と{dy}")
        return max(abs_dx, abs_dy) == 1 and (abs_dx != 0 or abs_dy != 0)
    elif movement_type == 'orthogonal':
        if max_steps is None:
            return (dx == 0 or dy == 0) and (abs_dx + abs_dy != 0)
        else:
            return ((abs_dx == 1 and dy == 0) or (dx == 0 and abs_dy == 1))
    elif movement_type == 'diagonal':
        return abs_dx == 1 and abs_dy == 1
    elif movement_type == 'special_hajike':
        return (abs_dx == 2 and abs_dy == 1) or (abs_dx == 1 and abs_dy == 2)
    else:
        return False

def is_square_occupied(game, x, y):
    """
    指定されたマスに既にコマが存在するかを判定する。
    """
    return Dog.objects.filter(game=game, x_position=x, y_position=y, is_in_hand=False).exists()

def is_adjacent_after_move(game, x, y, exclude_dog_id):
    """
    移動後のマスが他のコマと隣接しているかを判定する。
    """
    return is_adjacent_to_other_dogs(game, x, y, exclude_dog_id=exclude_dog_id)

def is_adjacent_after_place(game, x, y, dog):
    """
    配置後のマスが自分の他のコマと隣接しているかを判定する。
    """
    return is_adjacent_to_other_dogs(game, x, y, own_pieces_only=True, player=dog.player)

def is_adjacent_to_other_dogs(game, x, y, exclude_dog_id=None, own_pieces_only=False, player=None):
    """
    指定した座標が他のコマと隣接しているかを判定する。
    """
    adjacent_positions = [
        (x - 1, y - 1), (x, y - 1), (x + 1, y - 1),
        (x - 1, y),               (x + 1, y),
        (x - 1, y + 1), (x, y + 1), (x + 1, y + 1),
    ]
    other_dogs = Dog.objects.filter(game=game, is_in_hand=False).exclude(id=exclude_dog_id)
    if own_pieces_only and player:
        other_dogs = other_dogs.filter(player=player)
    for dog in other_dogs:
        if (dog.x_position, dog.y_position) in adjacent_positions:
            return True
    return False

def save_original_position(dog):
    """
    コマの元の位置を保存する。
    """
    return {'x': dog.x_position, 'y': dog.y_position}

def restore_original_position(dog, original_position):
    """
    コマの元の位置に戻す。
    """
    dog.x_position = original_position['x']
    dog.y_position = original_position['y']

def save_original_state(dog):
    """
    コマの元の状態を保存する。
    """
    return {'x': dog.x_position, 'y': dog.y_position, 'is_in_hand': dog.is_in_hand}

def restore_original_state(dog, original_state):
    """
    コマの元の状態に戻す。
    """
    dog.x_position = original_state['x']
    dog.y_position = original_state['y']
    dog.is_in_hand = original_state['is_in_hand']
