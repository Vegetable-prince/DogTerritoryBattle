from django.test import TestCase
from django.contrib.auth.models import User
from ..models import (
    DogType, Player, Game, Dog
)

class BaseTestCase(TestCase):
    def setUp(self):
        # ユーザーの作成
        self.user1 = User.objects.create_user(
            username='player1', email='player1@example.com',
            password='player1password'
        )
        self.user2 = User.objects.create_user(
            username='player2', email='player2@example.com',
            password='player2password'
        )

        # 犬種の作成
        self.dog_type_boss = DogType.objects.create(
            name='ボス犬', max_steps=1,
            movement_type='diagonal_orthogonal'
        )
        self.dog_type_aniki = DogType.objects.create(
            name='アニキ犬', max_steps=1,
            movement_type='diagonal_orthogonal'
        )
        self.dog_type_yaiba = DogType.objects.create(
            name='ヤイバ犬', max_steps=1,
            movement_type='orthogonal'
        )
        self.dog_type_mame = DogType.objects.create(
            name='豆でっぽう犬', max_steps=1,
            movement_type='diagonal'
        )
        self.dog_type_totsu = DogType.objects.create(
            name='トツ犬', movement_type='orthogonal'
        )
        self.dog_type_hajike = DogType.objects.create(
            name='ハジケ犬', movement_type='special_hajike'
        )

        # プレイヤーの作成
        self.player1 = Player.objects.create(user=self.user1)
        self.player2 = Player.objects.create(user=self.user2)

        # ゲームの作成
        self.game = Game.objects.create(
            current_turn=self.player2,
            player1=self.player1,
            player2=self.player2,
            winner=None
        )

        # 必要に応じて追加のセットアップを行う