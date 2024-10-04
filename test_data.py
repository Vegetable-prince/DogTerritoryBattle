import os
import django

# Djangoの設定を読み込む
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dogTerritoryBattle.settings')
print(f'DJANGO_SETTINGS_MODULE: {os.environ.get("DJANGO_SETTINGS_MODULE")}')
django.setup()

from django.contrib.auth.models import User
from game.models import Player, DogType, Game, Dog

# 管理者ユーザーを作成する
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'adminpassword')

# プレイヤーを作成する
if not User.objects.filter(username='player1').exists():
    user1 = User.objects.create_user('player1', 'player1@example.com', 'password1')
    player1 = Player.objects.create(user=user1)
else:
    player1 = Player.objects.get(user__username='player1')

if not User.objects.filter(username='player2').exists():
    user2 = User.objects.create_user('player2', 'player2@example.com', 'password2')
    player2 = Player.objects.create(user=user2)
else:
    player2 = Player.objects.get(user__username='player2')

# 犬の種類を作成する
dog_types = [
    {'name': 'ボス犬', 'movement_type': 'diagonal_orthogonal', 'max_steps': 1},
    {'name': 'アニキ犬', 'movement_type': 'diagonal_orthogonal', 'max_steps': 1},
    {'name': 'ヤイバ犬', 'movement_type': 'orthogonal', 'max_steps': 1},
    {'name': '豆でっぽう犬', 'movement_type': 'diagonal', 'max_steps': 1},
    {'name': 'トツ犬', 'movement_type': 'orthogonal', 'max_steps': None},  # 制限なし
    {'name': 'ハジケ犬', 'movement_type': 'special_hajike', 'max_steps': None}
]

for dog_type in dog_types:
    DogType.objects.get_or_create(name=dog_type['name'], movement_type=dog_type['movement_type'], max_steps=dog_type['max_steps'])

# ゲームを作成する
if not Game.objects.exists():
    game = Game.objects.create(player1=player1, player2=player2, current_turn=player1)
else:
    game = Game.objects.first()  # 既存のゲームがある場合、最初のゲームを取得する

# 犬のピースを作成する
dog_positions = [
    # Player 1's dogs
    {'game': game, 'player': player1, 'dog_type': DogType.objects.get(name='ボス犬'), 'x_position': 2, 'y_position': 1, 'is_in_hand': False},
    {'game': game, 'player': player1, 'dog_type': DogType.objects.get(name='アニキ犬'), 'x_position': None, 'y_position': None},
    {'game': game, 'player': player1, 'dog_type': DogType.objects.get(name='ヤイバ犬'), 'x_position': None, 'y_position': None},
    {'game': game, 'player': player1, 'dog_type': DogType.objects.get(name='豆でっぽう犬'), 'x_position': None, 'y_position': None},
    {'game': game, 'player': player1, 'dog_type': DogType.objects.get(name='トツ犬'), 'x_position': None, 'y_position': None},
    {'game': game, 'player': player1, 'dog_type': DogType.objects.get(name='ハジケ犬'), 'x_position': None, 'y_position': None},

    # Player 2's dogs
    {'game': game, 'player': player2, 'dog_type': DogType.objects.get(name='ボス犬'), 'x_position': 2, 'y_position': 3, 'is_in_hand': False},
    {'game': game, 'player': player2, 'dog_type': DogType.objects.get(name='アニキ犬'), 'x_position': None, 'y_position': None},
    {'game': game, 'player': player2, 'dog_type': DogType.objects.get(name='ヤイバ犬'), 'x_position': None, 'y_position': None},
    {'game': game, 'player': player2, 'dog_type': DogType.objects.get(name='豆でっぽう犬'), 'x_position': None, 'y_position': None},
    {'game': game, 'player': player2, 'dog_type': DogType.objects.get(name='トツ犬'), 'x_position': None, 'y_position': None},
    {'game': game, 'player': player2, 'dog_type': DogType.objects.get(name='ハジケ犬'), 'x_position': None, 'y_position': None},
]

for dog in dog_positions:
    Dog.objects.get_or_create(**dog)

print("テストデータの作成が完了しました。")
