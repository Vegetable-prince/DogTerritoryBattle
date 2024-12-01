from ..models import Dog
import logging
from django.db import models
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

# フィールドの最大サイズ（縦横）
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

def is_position_within_field(x, y, field_bounds):
    """
    指定された座標がフィールド内にあるかどうかを確認します。
    """
    if field_bounds['min_x'] is None or field_bounds['min_y'] is None:
        return False
    return field_bounds['min_x'] <= x <= field_bounds['max_x'] and field_bounds['min_y'] <= y <= field_bounds['max_y']

def calculate_field_bounds(game):
    """
    ゲーム内の全コマのフィールド範囲（最小・最大座標）と幅・高さを計算するヘルパー関数。
    """
    dogs_in_game = Dog.objects.filter(game=game, is_in_hand=False)
    if not dogs_in_game.exists():
        return {
            'min_x': None,
            'max_x': None,
            'min_y': None,
            'max_y': None,
            'width': 0,
            'height': 0
        }

    min_x = dogs_in_game.aggregate(min_x=models.Min('x_position'))['min_x']
    max_x = dogs_in_game.aggregate(max_x=models.Max('x_position'))['max_x']
    min_y = dogs_in_game.aggregate(min_y=models.Min('y_position'))['min_y']
    max_y = dogs_in_game.aggregate(max_y=models.Max('y_position'))['max_y']

    width = max_x - min_x + 1
    height = max_y - min_y + 1

    logger.debug(f"Calculated field bounds: min_x={min_x}, max_x={max_x}, min_y={min_y}, max_y={max_y}, width={width}, height={height}")

    return {
        'min_x': min_x,
        'max_x': max_x,
        'min_y': min_y,
        'max_y': max_y,
        'width': width,
        'height': height
    }

def isBossSurrounded(bossDog, boardDogs, playerId, field_bounds):
    """
    ボス犬が囲まれているかどうかを判定する関数。
    自分のコマも含めて囲み判定を行う。
    
    Args:
        bossDog (Dog): 判定対象のボス犬。
        boardDogs (QuerySet): ボード上の全コマ。
        playerId (int): 現在のプレイヤーID。
        field_bounds (dict): フィールドの範囲情報。
    
    Returns:
        bool: 囲まれている場合はTrue、そうでない場合はFalse。
    """
    min_x = field_bounds['min_x']
    max_x = field_bounds['max_x']
    min_y = field_bounds['min_y']
    max_y = field_bounds['max_y']
    width = field_bounds['width']
    height = field_bounds['height']

    boss_x = bossDog.x_position
    boss_y = bossDog.y_position

    logger.debug(f"Checking if boss dog at ({boss_x}, {boss_y}) is surrounded.")

    # 判定する方向: 上、下、左、右
    directions = [
        {'name': 'up', 'dx': 0, 'dy': -1},
        {'name': 'down', 'dx': 0, 'dy': 1},
        {'name': 'left', 'dx': -1, 'dy': 0},
        {'name': 'right', 'dx': 1, 'dy': 0},
    ]

    blocked_count = 0

    for direction in directions:
        adj_x = boss_x + direction['dx']
        adj_y = boss_y + direction['dy']

        logger.debug(f"Checking direction: {direction['name']}, position: ({adj_x}, {adj_y})")

        # フィールド外に出る場合
        is_edge = False
        if direction['dx'] == -1 and width >= FIELD_MAX_SIZE and adj_x < min_x:
            is_edge = True
            logger.debug(f"{direction['name']}方向はフィールド外に出ています。ブロックとみなします。")
        if direction['dx'] == 1 and width >= FIELD_MAX_SIZE and adj_x > max_x:
            is_edge = True
            logger.debug(f"{direction['name']}方向はフィールド外に出ています。ブロックとみなします。")
        if direction['dy'] == -1 and height >= FIELD_MAX_SIZE and adj_y < min_y:
            is_edge = True
            logger.debug(f"{direction['name']}方向はフィールド外に出ています。ブロックとみなします。")
        if direction['dy'] == 1 and height >= FIELD_MAX_SIZE and adj_y > max_y:
            is_edge = True
            logger.debug(f"{direction['name']}方向はフィールド外に出ています。ブロックとみなします。")

        # 隣接位置にコマが存在するか（自分のコマも含む）
        has_any_dog = any(
            dog.x_position == adj_x and dog.y_position == adj_y
            for dog in boardDogs
        )

        if is_edge or has_any_dog:
            blocked_count += 1
            logger.debug(f"{direction['name']}方向はブロックされています。")
        else:
            logger.debug(f"{direction['name']}方向はブロックされていません。")

    logger.debug(f"Blocked directions count: {blocked_count}")

    return blocked_count >= 4

def would_cause_self_loss(game, player):
    """
    プレイヤーのボス犬が囲まれているかをチェックするメソッド。
    各方向ごとにフィールドが最大サイズに達しているかを判定し、枠線によるブロックを適用します。
    """
    boss_dog = Dog.objects.filter(game=game, player=player, dog_type__name='ボス犬').first()
    if not boss_dog:
        logger.debug("ボス犬が存在しません。")
        return False  # ボス犬が存在しない場合、安全策として False を返す

    field_bounds = calculate_field_bounds(game)
    logger.debug(f"フィールドの範囲: {field_bounds}")

    boardDogs = Dog.objects.filter(game=game, is_in_hand=False)

    surrounded = isBossSurrounded(boss_dog, boardDogs, player, field_bounds)

    if surrounded:
        logger.debug("ボス犬が囲まれています。")
    else:
        logger.debug("ボス犬は囲まれていません。")

    return surrounded

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

    width = max_x - min_x + 1
    height = max_y - min_y + 1

    logger.debug(f"Field dimensions after move: width={width}, height={height}")

    return (width <= FIELD_MAX_SIZE) and (height <= FIELD_MAX_SIZE)

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

    logger.debug(f"is_valid_moveメソッド: {dog}の動きは{movement_type}で最大歩数が{max_steps}で最新の移動先が{dx}と{dy}")

    if movement_type == 'diagonal_orthogonal':
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
    field_bounds = calculate_field_bounds(game)
    return is_adjacent_to_other_dogs(game, x, y, exclude_dog_id=exclude_dog_id, field_bounds=field_bounds)

def is_adjacent_after_place(game, x, y, dog):
    """
    配置後のマスが自分の他のコマと隣接しているかを判定する。
    """
    return is_adjacent_to_other_dogs(game, x, y, own_pieces_only=True, player=dog.player)

def is_adjacent_to_other_dogs(game, x, y, exclude_dog_id=None, own_pieces_only=False, player=None, field_bounds=None):
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
            logger.debug(f"Adjacent dog found at ({dog.x_position}, {dog.y_position})")
            return True
    logger.debug("No adjacent dogs found.")
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