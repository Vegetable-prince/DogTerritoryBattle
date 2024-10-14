# dog_territory_battle_game/tests/test_models.py

from .base_test import BaseTestCase
from django.contrib.auth.models import User
from dog_territory_battle_game.models import Player, DogType, Game, Dog

class GameModelTestCase(BaseTestCase):
    def test_user_creation(self):
        self.assertEqual(User.objects.count(), 3)
        self.assertTrue(self.user1.is_active)
        self.assertEqual(self.admin_user.username, 'admin')

    def test_dog_type_creation(self):
        self.assertEqual(DogType.objects.count(), 6)
        self.assertEqual(self.dog_type_boss.name, 'ボス犬')
        self.assertEqual(self.dog_type_hajike.movement_type, 'special_hajike')

    def test_player_creation(self):
        self.assertEqual(Player.objects.count(), 2)
        self.assertEqual(self.player1.user.username, 'player1')

    def test_game_creation(self):
        self.assertEqual(Game.objects.count(), 1)
        self.assertEqual(self.game.player1, self.player1)
        self.assertEqual(self.game.current_turn, self.player2)
        self.assertIsNone(self.game.winner)