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
    admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'adminpassword')

# プレイヤーを作成する
if not User.objects.filter(username='player1').exists():
    user1 = User.objects.create_user('player1', 'player1@example.com', 'password1')
    player1 = Player.objects.create(user=user1)

if not User.objects.filter(username='player2').exists():
    user2 = User.objects.create_user('player2', 'player2@example.com', 'password2')
    player2 = Player.objects.create(user=user2)

# 犬の種類を作成する
dog_types = [
    {'name': 'ボス犬', 'movement_pattern': '縦横斜め8方向に1マス移動'},
    {'name': 'アニキ犬', 'movement_pattern': '縦横斜め8方向に1マス移動'},
    {'name': 'ヤイ犬', 'movement_pattern': '縦横4方向に1マス移動'},
    {'name': '豆でっぽう犬', 'movement_pattern': '斜め4方向に1マス移動'},
    {'name': 'トツ犬', 'movement_pattern': '縦横4方向に好きな数だけ移動'},
    {'name': 'ハジケ犬', 'movement_pattern': '縦横4方向に2マス進み、その後も縦横いずれかに1マス曲がる（3マス移動が可能）'}
]

for dog_type in dog_types:
    DogType.objects.get_or_create(name=dog_type['name'], movement_pattern=dog_type['movement_pattern'])

# ゲームを作成する
if not Game.objects.exists():
    game = Game.objects.create(player1=player1, player2=player2, current_turn=player1)

# 犬のピースを作成する
dog_positions = [
    {'game': game, 'player': player1, 'dog_type': DogType.objects.get(name='ボス犬'), 'x_position': 1, 'y_position': 1},
    {'game': game, 'player': player2, 'dog_type': DogType.objects.get(name='アニキ犬'), 'x_position': 2, 'y_position': 2},
    {'game': game, 'player': player1, 'dog_type': DogType.objects.get(name='ヤイ犬'), 'x_position': 3, 'y_position': 3},
    {'game': game, 'player': player2, 'dog_type': DogType.objects.get(name='豆でっぽう犬'), 'x_position': 4, 'y_position': 4},
]

for dog in dog_positions:
    Dog.objects.get_or_create(**dog)

print("テストデータの作成が完了しました。")