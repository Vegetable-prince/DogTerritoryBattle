import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dogTerritoryBattle.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from dog_territory_battle_game.models import DogType, Player, Game, Dog

def load_test_data():
    # ユーザー作成
    admin = User.objects.create_superuser(username='admin', email='admin@example.com', password='adminpassword')
    player1_user = User.objects.create_user(username='player1', email='player1@example.com', password='player1password', is_active=True)
    player2_user = User.objects.create_user(username='player2', email='player2@example.com', password='player2password', is_active=True)

    # ContentType 作成（Permissionの自動生成に必要な最低限のみ）
    content_types = {
        'logentry': ContentType.objects.get_or_create(app_label='admin', model='logentry')[0],
        'permission': ContentType.objects.get_or_create(app_label='auth', model='permission')[0],
        'group': ContentType.objects.get_or_create(app_label='auth', model='group')[0],
        'user': ContentType.objects.get_or_create(app_label='auth', model='user')[0],
        'contenttype': ContentType.objects.get_or_create(app_label='contenttypes', model='contenttype')[0],
        'session': ContentType.objects.get_or_create(app_label='sessions', model='session')[0],
        'dogtype': ContentType.objects.get_or_create(app_label='dog_territory_battle_game', model='dogtype')[0],
        'player': ContentType.objects.get_or_create(app_label='dog_territory_battle_game', model='player')[0],
        'game': ContentType.objects.get_or_create(app_label='dog_territory_battle_game', model='game')[0],
        'dog': ContentType.objects.get_or_create(app_label='dog_territory_battle_game', model='dog')[0],
    }

    # DogType 作成
    dogtypes = {
        'bulldog': DogType.objects.create(name='bulldog', max_steps=1, movement_type='diagonal_orthogonal'),
        'corgi': DogType.objects.create(name='corgi', max_steps=1, movement_type='diagonal_orthogonal'),
        'shepherd': DogType.objects.create(name='shepherd', max_steps=1, movement_type='orthogonal'),
        'shiba': DogType.objects.create(name='shiba', max_steps=1, movement_type='diagonal'),
        'husky': DogType.objects.create(name='husky', movement_type='orthogonal'),
        'raccoon': DogType.objects.create(name='raccoon', movement_type='special'),
    }

    # Player 作成
    player1 = Player.objects.create(user=player1_user)
    player2 = Player.objects.create(user=player2_user)

    # Game 作成
    game = Game.objects.create(current_turn_id=player2.id, player1_id=player1.id, player2_id=player2.id, winner_id=None)

    # Dog 作成（ポジションあり2体＋手札の犬たち）
    Dog.objects.create(dog_type=dogtypes['bulldog'], game=game, player=player1, x_position=0, y_position=0, is_in_hand=False)
    Dog.objects.create(dog_type=dogtypes['bulldog'], game=game, player=player2, x_position=0, y_position=1, is_in_hand=False)

    for dogtype_key in ['corgi', 'shepherd', 'shiba', 'husky', 'raccoon']:
        dogtype = dogtypes[dogtype_key]
        Dog.objects.create(dog_type=dogtype, game=game, player=player1, is_in_hand=True)
        Dog.objects.create(dog_type=dogtype, game=game, player=player2, is_in_hand=True)

if __name__ == "__main__":
    load_test_data()
