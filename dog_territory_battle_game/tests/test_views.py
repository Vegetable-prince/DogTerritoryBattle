from .base_test import BaseTestCase
from rest_framework.test import APIClient
from rest_framework import status
from dog_territory_battle_game.models import Dog

class DogTerritoryBattleViewsTest(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.client = APIClient()
        # デフォルトでプレイヤー1として認証
        self.client.force_authenticate(user=self.user1)
        # ゲームのターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

    def test_player_can_only_operate_own_pieces(self):
        """
        要件1: 各プレイヤーは自分のコマしか操作できないかどうか
        要件3: 現在のターンのプレイヤーのコマしか操作できないかどうか
        """
        # プレイヤー2のコマをフィールドに配置
        opponent_dog = Dog.objects.create(
            game=self.game, player=self.player2,
            dog_type=self.dog_type_yaiba,
            x_position=0, y_position=0, is_in_hand=False
        )

        # プレイヤー1が相手のコマを動かそうとする
        response = self.client.post(
            f'/api/dogs/{opponent_dog.id}/move/',
            {'x': 0, 'y': 1}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('他のプレイヤーのコマは操作できません。', response.data['detail'])

    def test_turn_switches_after_each_operation(self):
        """
        要件2: 各プレイヤーがコマの操作を一度行うたびに、もう片方のプレイヤーのターンに移るかどうか
        """
        # プレイヤー1のコマを手札からフィールドに配置
        dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss, is_in_hand=True
        )

        # プレイヤー1がコマを配置
        response = self.client.post(
            f'/api/dogs/{dog.id}/place_on_board/',
            {'x': 0, 'y': 0}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # ゲームのターンがプレイヤー2に移っているか確認
        self.game.refresh_from_db()
        self.assertEqual(self.game.current_turn, self.player2)

    def test_piece_moves_according_to_movement_type(self):
        """
        要件4: 各コマはその movement_type に従った行動しか取れないかどうか
        """
        # 斜め犬をフィールドに配置
        dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_mame,
            x_position=0, y_position=0, is_in_hand=False
        )

        # 有効な斜め移動
        response = self.client.post(
            f'/api/dogs/{dog.id}/move/',
            {'x': 1, 'y': 1}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 無効な縦移動
        # ターンを再度プレイヤー1に戻す
        self.game.current_turn = self.player1
        self.game.save()
        response = self.client.post(
            f'/api/dogs/{dog.id}/move/',
            {'x': 1, 'y': 2}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('この犬種では無効な移動です。', response.data['error'])

    def test_cannot_move_to_occupied_square(self):
        """
        要件5: すでにコマがあるマスには移動できないかどうか
        """
        # プレイヤー1のコマをフィールドに配置
        dog1 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_yaiba,
            x_position=0, y_position=0, is_in_hand=False
        )

        # 別のコマを同じ位置に配置しようとする
        dog2 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_yaiba,
            is_in_hand=True
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # コマを配置しようとする
        response = self.client.post(
            f'/api/dogs/{dog2.id}/place_on_board/',
            {'x': 0, 'y': 0}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('そのマスには既にコマがあります。', response.data['error'])

    def test_cannot_move_if_not_adjacent_after_move(self):
        """
        要件6: コマを移動した後に他のコマと隣接していない場合は移動できないかどうか
        """
        # フィールドにコマを1つ配置
        dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss,
            x_position=0, y_position=0, is_in_hand=False
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # 離れた位置に移動しようとする
        response = self.client.post(
            f'/api/dogs/{dog.id}/move/',
            {'x': 5, 'y': 5}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('他のコマと隣接していない場所には移動できません。', response.data['error'])

    def test_cannot_remove_piece_if_would_leave_non_adjacent_pieces(self):
        """
        要件7: コマを手札に戻した後に、フィールドに他のコマと隣接していないコマがある場合は手札に戻せないかどうか
        """
        # フィールドに2つのコマを配置（離れた位置）
        dog1 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss,
            x_position=0, y_position=0, is_in_hand=False
        )
        dog2 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_aniki,
            x_position=5, y_position=5, is_in_hand=False
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # コマを手札に戻そうとする
        response = self.client.post(
            f'/api/dogs/{dog1.id}/remove_from_board/'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('このコマを手札に戻すと、他のコマが孤立します。', response.data['error'])

    def test_winner_declared_when_boss_dog_surrounded(self):
        """
        要件8: コマの操作後にボス犬が囲まれた場合に勝者判定されるかどうか
        """
        # プレイヤー1のボス犬を配置
        boss_dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss,
            x_position=1, y_position=1, is_in_hand=False
        )

        # プレイヤー2のコマでボス犬を囲む
        positions = [(1, 0), (0, 1), (1, 2), (2, 1)]
        for x, y in positions[:-1]:
            Dog.objects.create(
                game=self.game, player=self.player2,
                dog_type=self.dog_type_yaiba,
                x_position=x, y_position=y, is_in_hand=False
            )

        # ターンをプレイヤー2に設定
        self.game.current_turn = self.player2
        self.game.save()

        # 最後のコマを配置してボス犬を囲む
        last_dog = Dog.objects.create(
            game=self.game, player=self.player2,
            dog_type=self.dog_type_yaiba,
            is_in_hand=True
        )
        response = self.client.post(
            f'/api/dogs/{last_dog.id}/place_on_board/',
            {'x': positions[-1][0], 'y': positions[-1][1]}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('winner', response.data)
        self.assertEqual(response.data['winner'], self.player2.user.username)

    def test_boss_dog_cannot_be_removed_from_board(self):
        """
        要件9: ボス犬は手札に戻せないかどうか
        """
        # プレイヤー1のボス犬をフィールドに配置
        boss_dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss,
            x_position=0, y_position=0, is_in_hand=False
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # ボス犬を手札に戻そうとする
        response = self.client.post(
            f'/api/dogs/{boss_dog.id}/remove_from_board/'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('ボス犬は手札に戻せません。', response.data['error'])

    def test_board_size_not_exceed_4x4_after_operation(self):
        """
        要件10: コマの操作後にフィールドの全コマの配置が縦横4マスを超えていないかどうか
        """
        # フィールドにコマを配置
        dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_yaiba,
            x_position=0, y_position=0, is_in_hand=False
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # 4x4を超える位置に移動しようとする
        response = self.client.post(
            f'/api/dogs/{dog.id}/move/',
            {'x': 5, 'y': 0}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('フィールドのサイズを超えるため移動できません。', response.data['error'])
