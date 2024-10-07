from django.test import TestCase
from django.contrib.auth.models import User
from game.models import Player, DogType, Game, Dog

class GameModelTestCase(TestCase):
    def setUp(self):
        # ユーザーとプレイヤーの作成
        self.user1 = User.objects.create_user(username='player1', password='password')
        self.user2 = User.objects.create_user(username='player2', password='password')
        self.player1 = Player.objects.create(user=self.user1)
        self.player2 = Player.objects.create(user=self.user2)

        # 犬の種類の作成
        self.dog_type_boss = DogType.objects.create(
            name='ボス犬',
            movement_type='diagonal_orthogonal',
            max_steps=1
        )

        # ゲームの作成
        self.game = Game.objects.create(
            player1=self.player1,
            player2=self.player2,
            current_turn=self.player1
        )

        # 犬の作成
        self.dog1 = Dog.objects.create(
            game=self.game,
            player=self.player1,
            dog_type=self.dog_type_boss,
            is_in_hand=True
        )

    def test_dog_creation(self):
        self.assertEqual(Dog.objects.count(), 1)
        self.assertEqual(self.dog1.player, self.player1)
        self.assertEqual(self.dog1.dog_type.name, 'ボス犬')