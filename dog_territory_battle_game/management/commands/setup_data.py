from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from dog_territory_battle_game.models import Player, DogType, Game, Dog


class Command(BaseCommand):
    help = "Set up initial data for the game"

    def handle(self, *args, **kwargs):
        # 1. 管理ユーザーを作成
        admin_user = User.objects.create_superuser(
            username="admin", email="admin@example.com", password="adminpassword"
        )
        self.stdout.write("Admin user created.")

        # 2. Playerを2つ作成
        player1_user = User.objects.create_user(
            username="player1", email="player1@example.com", password="password"
        )
        player2_user = User.objects.create_user(
            username="player2", email="player2@example.com", password="password"
        )
        player1 = Player.objects.create(user=player1_user)
        player2 = Player.objects.create(user=player2_user)
        self.stdout.write("Players created.")

        # 3. DogTypeを6つ作成
        dog_types = [
            {"name": "ボス犬", "movement_type": "diagonal_orthogonal", "max_steps": 1},
            {"name": "アニキ犬", "movement_type": "diagonal_orthogonal", "max_steps": 1},
            {"name": "ヤイバ犬", "movement_type": "orthogonal", "max_steps": 1},
            {"name": "豆でっぽう犬", "movement_type": "diagonal", "max_steps": 1},
            {"name": "トツ犬", "movement_type": "orthogonal", "max_steps": None},
            {"name": "ハジケ犬", "movement_type": "special_hajike", "max_steps": None},
        ]
        dog_type_objects = []
        for data in dog_types:
            dog_type_objects.append(DogType.objects.create(**data))
        self.stdout.write("Dog types created.")

        # 4. Gameを1つ作成
        game = Game.objects.create(
            player1=player1,
            player2=player2,
            current_turn=player1,
            winner=None,
        )
        self.stdout.write("Game created.")

        # 5. Dogを12レコード作成
        dog_data = [
            {"game": game, "player": player1, "dog_type": dog_type_objects[0], "x_position": 1, "y_position": 0, "is_in_hand": False},
            {"game": game, "player": player1, "dog_type": dog_type_objects[1], "x_position": None, "y_position": None, "is_in_hand": True},
            {"game": game, "player": player1, "dog_type": dog_type_objects[2], "x_position": None, "y_position": None, "is_in_hand": True},
            {"game": game, "player": player1, "dog_type": dog_type_objects[3], "x_position": None, "y_position": None, "is_in_hand": True},
            {"game": game, "player": player1, "dog_type": dog_type_objects[4], "x_position": None, "y_position": None, "is_in_hand": True},
            {"game": game, "player": player1, "dog_type": dog_type_objects[5], "x_position": None, "y_position": None, "is_in_hand": True},
            {"game": game, "player": player2, "dog_type": dog_type_objects[0], "x_position": 1, "y_position": 1, "is_in_hand": False},
            {"game": game, "player": player2, "dog_type": dog_type_objects[1], "x_position": None, "y_position": None, "is_in_hand": True},
            {"game": game, "player": player2, "dog_type": dog_type_objects[2], "x_position": None, "y_position": None, "is_in_hand": True},
            {"game": game, "player": player2, "dog_type": dog_type_objects[3], "x_position": None, "y_position": None, "is_in_hand": True},
            {"game": game, "player": player2, "dog_type": dog_type_objects[4], "x_position": None, "y_position": None, "is_in_hand": True},
            {"game": game, "player": player2, "dog_type": dog_type_objects[5], "x_position": None, "y_position": None, "is_in_hand": True},
        ]
        for data in dog_data:
            Dog.objects.create(**data)
        self.stdout.write("Dogs created.")