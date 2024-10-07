from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.db import migrations
from game.models import DogType, Player, Game

def load_test_data():
    # auth_user テーブルのデータ
    User.objects.create_superuser(username='admin', email='admin@example.com', password='adminpassword')
    User.objects.create_user(username='player1', email='player1@example.com', password='player1password', is_active=True)
    User.objects.create_user(username='player2', email='player2@example.com', password='player2password', is_active=True)
    
    # django_content_type テーブルのデータ
    ContentType.objects.get_or_create(app_label='admin', model='logentry')
    ContentType.objects.get_or_create(app_label='auth', model='permission')
    ContentType.objects.get_or_create(app_label='auth', model='group')
    ContentType.objects.get_or_create(app_label='auth', model='user')
    ContentType.objects.get_or_create(app_label='contenttypes', model='contenttype')
    ContentType.objects.get_or_create(app_label='sessions', model='session')
    ContentType.objects.get_or_create(app_label='game', model='player')
    ContentType.objects.get_or_create(app_label='game', model='dogtype')
    ContentType.objects.get_or_create(app_label='game', model='game')
    ContentType.objects.get_or_create(app_label='game', model='dog')

    # django_migrations テーブルのデータは通常テストで再現しないため省略

    # game_dogtype テーブルのデータ
    DogType.objects.create(name='ボス犬', max_steps=1, movement_type='diagonal_orthogonal')
    DogType.objects.create(name='アニキ犬', max_steps=1, movement_type='diagonal_orthogonal')
    DogType.objects.create(name='ヤイバ犬', max_steps=1, movement_type='orthogonal')
    DogType.objects.create(name='豆でっぽう犬', max_steps=1, movement_type='diagonal')
    DogType.objects.create(name='トツ犬', movement_type='orthogonal')
    DogType.objects.create(name='ハジケ犬', movement_type='special_hajike')

    # game_player テーブルのデータ
    player1 = User.objects.get(username='player1')
    player2 = User.objects.get(username='player2')
    Player.objects.create(user=player1)
    Player.objects.create(user=player2)

    # game_game テーブルのデータ
    game = Game.objects.create(current_turn_id=2, player1_id=player1.id, player2_id=player2.id, winner_id=None, test=None)

if __name__ == "__main__":
    load_test_data()