from .base_test import BaseTestCase
from rest_framework.test import APIClient
from rest_framework import status
from dog_territory_battle_game.models import Dog
from django.urls import reverse
import logging

logger = logging.getLogger(__name__)

class DogTerritoryBattleViewsTest(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.client = APIClient()
        # デフォルトでプレイヤー1として認証
        self.client.force_authenticate(user=self.user1)
        # ゲームのターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

    def test_player_can_operate_only_own_pieces(self):
        """
        テスト1: 各プレイヤーは自分のコマしか操作できないかどうか（ネガティブチェック）
        """
        logger.debug("テスト開始: テスト1 - 各プレイヤーは自分のコマしか操作できないかどうか (ネガティブチェック)")
        # プレイヤー2のコマをフィールドに配置
        opponent_dog = Dog.objects.create(
            game=self.game, player=self.player2,
            dog_type=self.dog_type_yaiba,
            x_position=0, y_position=0, is_in_hand=False
        )

        # プレイヤー1が相手のコマを動かそうとする
        url = f'/api/dogs/{opponent_dog.id}/move/'
        response = self.client.post(url, {'x': 0, 'y': 1})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('まだあなたのターンではありません！', response.data.get('error', ''))
        logger.debug("テスト終了: テスト1 - ネガティブチェック")

    def test_player_can_operate_only_own_pieces_positive(self):
        """
        テスト2: 各プレイヤーは自分のコマしか操作できないかどうか（ポジティブチェック）
        """
        logger.debug("テスト開始: テスト2 - 各プレイヤーは自分のコマしか操作できないかどうか (ポジティブチェック)")
        # プレイヤー1のコマをフィールドに配置
        own1_dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_yaiba,
            x_position=1, y_position=1, is_in_hand=False
        )

        # プレイヤー1の二体目のコマをフィールドに配置
        own2_dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_yaiba,
            x_position=0, y_position=1, is_in_hand=False
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # プレイヤー1が自分のコマを動かす
        url = f'/api/dogs/{own1_dog.id}/move/'
        response = self.client.post(url, {'x': 1, 'y': 2})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        logger.debug("テスト終了: テスト2 - ポジティブチェック")

    def test_turn_switches_after_each_operation(self):
        """
        テスト3: 各プレイヤーがコマの操作を一度行うたびに、もう片方のプレイヤーのターンに移るかどうか
        """
        logger.debug("テスト開始: テスト3 - ターンの切り替え")
        # プレイヤー1のコマを手札からフィールドに配置
        dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_yaiba, is_in_hand=True
        )

        # プレイヤー1のコマを手札からフィールドに配置
        opponent_dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_yaiba,
            x_position=0, y_position=0, is_in_hand=False
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # プレイヤー1がコマを配置
        response = self.client.post(
            f'/api/dogs/{dog.id}/place_on_board/',
            {'x': 1, 'y': 0}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # ゲームのターンがプレイヤー2に移っているか確認
        self.game.refresh_from_db()
        self.assertEqual(self.game.current_turn, self.player2)
        logger.debug("テスト終了: テスト3 - ターンの切り替え")

    def test_piece_moves_according_to_movement_type_positive(self):
        """
        テスト4: 各コマはその movement_type に従った行動しか取れないかどうか（ポジティブチェック）
        """
        logger.debug("テスト開始: テスト4 - movement_type に従った有効な移動 (ポジティブチェック)")
        # 各コマを初期位置に配置
        movement_tests = [
            # (犬種, 初期位置, 有効な移動先)
            (self.dog_type_boss, (0, 1), (0, 0)),  # ボス犬
            (self.dog_type_aniki, (1, 0), (0, 1)),  # アニキ犬
            (self.dog_type_yaiba, (0, 2), (1, 2)),  # ヤイバ犬
            (self.dog_type_mame, (1, 1), (2, 2)),  # 豆でっぽう犬
            (self.dog_type_totsu, (3, 0), (3, 1)),  # トツ犬
            (self.dog_type_hajike, (2, 0), (3, 2)),  # ハジケ犬
        ]

        dogs = []
        for dog_type, start_pos, valid_move in movement_tests:
            dog = Dog.objects.create(
                game=self.game, player=self.player1,
                dog_type=dog_type,
                x_position=start_pos[0], y_position=start_pos[1], is_in_hand=False
            )
            dogs.append(dog)

        # 各犬種ごとに有効な移動をテスト
        for index, (dog_type, _, valid_move) in enumerate(movement_tests):
            dog = dogs[index]
            with self.subTest(dog_type=dog_type.name):
                # ターンをプレイヤー1に設定
                self.game.current_turn = self.player1
                self.game.save()

                url = f'/api/dogs/{dog.id}/move/'
                response = self.client.post(url, {'x': valid_move[0], 'y': valid_move[1]})
                self.assertEqual(response.status_code, status.HTTP_200_OK, msg=f"Valid move failed for {dog_type.name}")
                logger.debug(f"Moved {dog_type.name} to {valid_move}")
        logger.debug("テスト終了: テスト4 - ポジティブチェック")

    def test_piece_moves_according_to_movement_type_negative(self):
        """
        テスト5: 各コマはその movement_type に従った行動しか取れないかどうか（ネガティブチェック）
        """
        logger.debug("テスト開始: テスト5 - movement_type に従った無効な移動 (ネガティブチェック)")
        # 各コマを初期位置に配置
        movement_tests = [
            # (犬種, 初期位置, 無効な移動先)
            (self.dog_type_boss, (0, 1), (2, 2)),  # ボス犬
            (self.dog_type_aniki, (1, 0), (3, 3)),  # アニキ犬
            (self.dog_type_yaiba, (0, 2), (2, 1)),  # ヤイバ犬
            (self.dog_type_mame, (1, 1), (3, 2)),  # 豆でっぽう犬
            (self.dog_type_totsu, (3, 0), (2, 3)),  # トツ犬
            (self.dog_type_hajike, (2, 0), (2, 2)),  # ハジケ犬
        ]

        dogs = []
        for dog_type, start_pos, invalid_move in movement_tests:
            dog = Dog.objects.create(
                game=self.game, player=self.player1,
                dog_type=dog_type,
                x_position=start_pos[0], y_position=start_pos[1], is_in_hand=False
            )
            dogs.append(dog)

        # 各犬種ごとに無効な移動をテスト
        for index, (dog_type, _, invalid_move) in enumerate(movement_tests):
            dog = dogs[index]
            with self.subTest(dog_type=dog_type.name):
                # ターンをプレイヤー1に設定
                self.game.current_turn = self.player1
                self.game.save()

                url = f'/api/dogs/{dog.id}/move/'
                response = self.client.post(url, {'x': invalid_move[0], 'y': invalid_move[1]})

                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, msg=f"Invalid move did not fail for {dog_type.name}")
                self.assertIn('この犬種では無効な移動です。', response.data.get('error', ''), msg=f"Incorrect error message for {dog_type.name}")
                logger.debug(f"Failed to move {dog_type.name} to {invalid_move} as expected")
        logger.debug("テスト終了: テスト5 - ネガティブチェック")

    def test_cannot_move_to_occupied_square(self):
        """
        テスト6: すでにコマがあるマスには移動できないかどうか
        """
        logger.debug("テスト開始: テスト6 - すでにコマがあるマスへの移動禁止")
        # プレイヤー1のコマをフィールドに配置
        dog1 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_yaiba,
            x_position=0, y_position=0, is_in_hand=False
        )

        # 別のコマを手札に持つ
        dog2 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_yaiba,
            is_in_hand=True
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # コマを配置しようとする（配置先が既に埋まっている）
        response = self.client.post(
            f'/api/dogs/{dog2.id}/place_on_board/',
            {'x': 0, 'y': 0}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('そのマスには既にコマがあります。', response.data.get('error', ''))
        logger.debug("テスト終了: テスト6 - すでにコマがあるマスへの移動禁止 (ネガティブチェック)")

        # ターンを再度プレイヤー1に戻す
        self.game.current_turn = self.player1
        self.game.save()

        # dog2を別の場所に配置
        response = self.client.post(
            f'/api/dogs/{dog2.id}/place_on_board/',
            {'x': 1, 'y': 0}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        logger.debug("dog2を(1,0)に配置成功")

        # ターンを再度プレイヤー1に戻す
        self.game.current_turn = self.player1
        self.game.save()

        # dog1をdog2の位置に移動させようとする（移動先が既に埋まっている）
        response = self.client.post(
            f'/api/dogs/{dog1.id}/move/',
            {'x': 1, 'y': 0}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('そのマスには既にコマがあります。', response.data.get('error', ''))
        logger.debug("テスト終了: テスト6 - すでにコマがあるマスへの移動禁止 (ネガティブチェック)")

    def test_move_if_adjacent_after_move_positive(self):
        """
        テスト7: コマを移動した後に他のコマと隣接している場合は移動できるかどうか（ポジティブチェック）
        """
        logger.debug("テスト開始: テスト7 - 移動後に他のコマと隣接している場合の移動許可 (ポジティブチェック)")
        # フィールドに2つのコマを配置
        # dog1を(0,0)に配置
        dog1 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss,
            x_position=0, y_position=0, is_in_hand=False
        )
        # dog2を(1,0)に配置（dog1と隣接）
        dog2 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_aniki,
            x_position=1, y_position=0, is_in_hand=False
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # dog1を(0,1)に移動させる（移動後もdog2と隣接）
        response = self.client.post(
            f'/api/dogs/{dog1.id}/move/',
            {'x': 0, 'y': 1}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, "移動が成功しました。")
        logger.debug("dog1を(0,1)に移動成功")
        logger.debug("テスト終了: テスト7 - ポジティブチェック")

    def test_move_if_adjacent_after_move_negative(self):
        """
        テスト8: コマを移動した後に他のコマと隣接していない場合は移動できないかどうか（ネガティブチェック）
        """
        logger.debug("テスト開始: テスト8 - 移動後に他のコマと隣接していない場合の移動禁止 (ネガティブチェック)")
        # フィールドに2つのコマを配置
        # dog1を(1,1)に配置
        dog1 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss,
            x_position=1, y_position=1, is_in_hand=False
        )
        # dog2を(2,1)に配置（dog1と隣接）
        dog2 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_aniki,
            x_position=2, y_position=1, is_in_hand=False
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # dog1を(0,2)に移動させる（移動後、dog2と隣接しない）
        response = self.client.post(
            f'/api/dogs/{dog1.id}/move/',
            {'x': 0, 'y': 2}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "隣接していない場所への移動が拒否されませんでした。")
        self.assertIn('他のコマと隣接していない場所には移動できません。', response.data.get('error', ''))
        logger.debug("移動が正しくブロックされました")
        logger.debug("テスト終了: テスト8 - ネガティブチェック")

    def test_place_on_board_adjacent_to_own_piece_positive(self):
        """
        テスト9: コマを配置した後に自分の他のコマと隣接している場合は配置できるかどうか（ポジティブチェック）
        """
        logger.debug("テスト開始: テスト9 - 配置後に自分の他のコマと隣接している場合の配置許可 (ポジティブチェック)")
        # 自分のコマを(0,0)に配置
        dog1 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss,
            x_position=0, y_position=0, is_in_hand=False
        )

        # 手札にあるコマを取得
        dog2 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_aniki,
            is_in_hand=True
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # 自分のコマに隣接する位置に配置（成功するはず）
        response = self.client.post(
            f'/api/dogs/{dog2.id}/place_on_board/',
            {'x': 1, 'y': 0}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('success', False))
        logger.debug("dog2を(1,0)に配置成功")
        logger.debug("テスト終了: テスト9 - ポジティブチェック")

    def test_place_on_board_adjacent_to_own_piece_negative(self):
        """
        テスト10: コマを配置した後に自分の他のコマと隣接していない場合は配置できないかどうか（ネガティブチェック）
        """
        logger.debug("テスト開始: テスト10 - 配置後に自分の他のコマと隣接していない場合の配置禁止 (ネガティブチェック)")
        # 相手のコマを(0,0)に配置
        opponent_dog = Dog.objects.create(
            game=self.game, player=self.player2,
            dog_type=self.dog_type_boss,
            x_position=0, y_position=0, is_in_hand=False
        )

        # 手札にある自分のコマを取得
        dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_aniki,
            is_in_hand=True
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # 相手のコマに隣接する位置に配置（自分のコマと隣接していないので失敗するはず）
        response = self.client.post(
            f'/api/dogs/{dog.id}/place_on_board/',
            {'x': 1, 'y': 0}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('他のコマと隣接していない場所には配置できません。', response.data.get('error', ''))
        logger.debug("dogを(1,0)に配置しようとしましたがブロックされました")
        logger.debug("テスト終了: テスト10 - ネガティブチェック")

    def test_cannot_remove_piece_if_would_leave_non_adjacent_pieces_negative(self):
        """
        テスト11: コマを手札に戻した後に、フィールドに他のコマと隣接していないコマがある場合は手札に戻せないかどうか（ネガティブチェック）
        """
        logger.debug("テスト開始: テスト11 - 他のコマが孤立する場合のコマの手札戻し禁止 (ネガティブチェック)")
        # フィールドに2つのコマを配置（離れた位置）
        dog1 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss,
            x_position=0, y_position=0, is_in_hand=False
        )
        dog2 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_aniki,
            x_position=0, y_position=1, is_in_hand=False
        )
        dog3 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_aniki,
            x_position=0, y_position=2, is_in_hand=False
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # コマを手札に戻そうとする
        response = self.client.post(
            f'/api/dogs/{dog2.id}/remove_from_board/'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('このコマを手札に戻すと、他のコマが孤立します。', response.data.get('error', ''))
        logger.debug("dog2を手札に戻そうとしましたがブロックされました")
        logger.debug("テスト終了: テスト11 - ネガティブチェック")

    def test_can_remove_piece_if_pieces_remain_adjacent_positive(self):
        """
        テスト12: コマを手札に戻しても、残りのコマが隣接している場合は手札に戻せるかどうか（ポジティブチェック）
        """
        logger.debug("テスト開始: テスト12 - 残りのコマが隣接している場合のコマの手札戻し許可 (ポジティブチェック)")
        # フィールドに3つのコマを配置
        dog1 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss,
            x_position=0, y_position=0, is_in_hand=False
        )
        dog2 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_aniki,
            x_position=0, y_position=1, is_in_hand=False
        )
        dog3 = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_mame,
            x_position=1, y_position=1, is_in_hand=False
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # dog3を手札に戻す
        response = self.client.post(
            f'/api/dogs/{dog3.id}/remove_from_board/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('success', False))
        logger.debug("dog3を手札に戻すことに成功しました")

        # 残りのコマが隣接していることを確認
        dog1.refresh_from_db()
        dog2.refresh_from_db()
        dog3.refresh_from_db()
        self.assertFalse(dog1.is_in_hand)
        self.assertFalse(dog2.is_in_hand)
        self.assertTrue(dog3.is_in_hand)
        logger.debug("残りのコマが隣接していることを確認しました")
        logger.debug("テスト終了: テスト12 - ポジティブチェック")

    def test_winner_declared_when_boss_dog_surrounded_by_placing_piece_positive(self):
        """
        テスト13: プレイヤー2がコマを配置してボス犬を囲み、勝利するかどうか（ポジティブチェック）
        """
        logger.debug("テスト開始: テスト13 - コマを配置してボス犬を囲み勝利 (ポジティブチェック)")
        # プレイヤー1のボス犬を(1,1)に配置
        boss_dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss,
            x_position=1, y_position=1, is_in_hand=False
        )

        # プレイヤー2のコマでボス犬を囲む（3方向）
        positions = [(1, 0), (0, 1), (2, 1)]
        for x, y in positions:
            Dog.objects.create(
                game=self.game, player=self.player2,
                dog_type=self.dog_type_yaiba,
                x_position=x, y_position=y, is_in_hand=False
            )

        # ターンをプレイヤー2に設定
        self.game.current_turn = self.player2
        self.game.save()

        # 手札から最後のコマを配置してボス犬を囲む
        last_dog = Dog.objects.create(
            game=self.game, player=self.player2,
            dog_type=self.dog_type_yaiba,
            is_in_hand=True
        )
        response = self.client.post(
            f'/api/dogs/{last_dog.id}/place_on_board/',
            {'x': 1, 'y': 2}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('winner', response.data)
        self.assertEqual(response.data.get('winner'), self.player2.user.username)
        logger.debug(f"プレイヤー2が勝者として認定されました: {self.player2.user.username}")
        logger.debug("テスト終了: テスト13 - ポジティブチェック")

    def test_winner_declared_when_boss_dog_surrounded_by_moving_piece_positive(self):
        """
        テスト14: プレイヤー2がコマを移動してボス犬を囲み、勝利するかどうか（ポジティブチェック）
        """
        logger.debug("テスト開始: テスト14 - コマを移動してボス犬を囲み勝利 (ポジティブチェック)")
        # プレイヤー1のボス犬を(1,1)に配置
        boss_dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss,
            x_position=1, y_position=1, is_in_hand=False
        )

        # プレイヤー2のコマでボス犬を囲む（3方向）
        positions = [(0, 1), (2, 1), (3, 1), (1, 2), (1, 3)]
        for x, y in positions:
            Dog.objects.create(
                game=self.game, player=self.player2,
                dog_type=self.dog_type_yaiba,
                x_position=x, y_position=y, is_in_hand=False
            )
        
        moving_dog = Dog.objects.create(
            game=self.game, player=self.player2,
            dog_type=self.dog_type_boss,
            x_position=2, y_position=0, is_in_hand=False
        )

        # ターンをプレイヤー2に設定
        self.game.current_turn = self.player2
        self.game.save()

        # コマを移動してボス犬を囲む
        response = self.client.post(
            f'/api/dogs/{moving_dog.id}/move/',
            {'x': 1, 'y': 0}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('winner', response.data)
        self.assertEqual(response.data.get('winner'), self.player2.user.username)
        logger.debug(f"プレイヤー2が勝者として認定されました: {self.player2.user.username}")
        logger.debug("テスト終了: テスト14 - ポジティブチェック")

    def test_winner_declared_in_specific_board_state_positive(self):
        """
        テスト15: 特定のボード状態でプレイヤー2が勝利するかどうか（ポジティブチェック）
        """
        logger.debug("テスト開始: テスト15 - 特定のボード状態でプレイヤー2が勝利 (ポジティブチェック)")

        # プレイヤー1のボス犬を(0,0)に配置
        boss_dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss,
            x_position=0, y_position=0, is_in_hand=False
        )

        # プレイヤー2のコマを配置
        positions = [(2, 0), (0, 1), (1, 1), (2, 1), (3, 1), (1, 2), (1, 3)]
        for x, y in positions:
            Dog.objects.create(
                game=self.game, player=self.player2,
                dog_type=self.dog_type_yaiba,
                x_position=x, y_position=y, is_in_hand=False
            )

        # ターンをプレイヤー2に設定
        self.game.current_turn = self.player2
        self.game.save()

        # 手札からコマを(1,0)に配置してボス犬を囲む
        last_dog = Dog.objects.create(
            game=self.game, player=self.player2,
            dog_type=self.dog_type_yaiba,
            is_in_hand=True
        )
        response = self.client.post(
            f'/api/dogs/{last_dog.id}/place_on_board/',
            {'x': 1, 'y': 0}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('winner', response.data)
        self.assertEqual(response.data.get('winner'), self.player2.user.username)
        logger.debug(f"プレイヤー2が勝者として認定されました: {self.player2.user.username}")
        logger.debug("テスト終了: テスト15 - ポジティブチェック")

    def test_boss_dog_cannot_be_removed_from_board_negative(self):
        """
        テスト16: ボス犬は手札に戻せないかどうか（ネガティブチェック）
        """
        logger.debug("テスト開始: テスト16 - ボス犬の手札戻し禁止 (ネガティブチェック)")
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
        self.assertIn('ボス犬は手札に戻せません。', response.data.get('error', ''))
        logger.debug("ボス犬を手札に戻そうとしましたがブロックされました")
        logger.debug("テスト終了: テスト16 - ネガティブチェック")

    def test_board_size_not_exceed_4x4_after_operation_negative(self):
        """
        テスト17: コマの操作後にフィールドの全コマの配置が縦横4マスを超えていないかどうか（ネガティブチェック）
        """
        logger.debug("テスト開始: テスト17 - フィールドサイズ超過の防止 (ネガティブチェック)")
        # 縦方向のコマを配置（x=0, y=1～4）
        for y in range(1, 5):
            Dog.objects.create(
                game=self.game, player=self.player1,
                dog_type=self.dog_type_yaiba,
                x_position=0, y_position=y, is_in_hand=False
            )

        # 横方向のコマを配置（x=1～4, y=0）
        for x in range(1, 5):
            Dog.objects.create(
                game=self.game, player=self.player1,
                dog_type=self.dog_type_yaiba,
                x_position=x, y_position=0, is_in_hand=False
            )

        # ボス犬を配置（x=4, y=4）
        boss_dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss,
            x_position=4, y_position=4, is_in_hand=False
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # 縦に4マスを超えるテスト（y=5に移動）
        response = self.client.post(
            f'/api/dogs/{boss_dog.id}/move/',
            {'x': 4, 'y': 5}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('フィールドのサイズを超えるため移動できません。', response.data.get('error', ''))
        logger.debug("ボス犬を(4,5)に移動しようとしましたがブロックされました")

        # ターンを再度プレイヤー1に戻す
        self.game.current_turn = self.player1
        self.game.save()

        # 横に4マスを超えるテスト（x=5に移動）
        response = self.client.post(
            f'/api/dogs/{boss_dog.id}/move/',
            {'x': 5, 'y': 4}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('フィールドのサイズを超えるため移動できません。', response.data.get('error', ''))
        logger.debug("ボス犬を(5,4)に移動しようとしましたがブロックされました")
        logger.debug("テスト終了: テスト17 - ネガティブチェック")

    def test_cannot_move_piece_if_it_causes_self_boss_surrounded_negative(self):
        """
        テスト18: 自分のボス犬が囲まれる移動を阻止できるかどうか（ネガティブチェック）
        """
        logger.debug("テスト開始: テスト18 - 自分のボス犬が囲まれる移動の阻止 (ネガティブチェック)")
        # プレイヤー1のボス犬を(1,1)に配置
        boss_dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss,
            x_position=1, y_position=1, is_in_hand=False
        )

        # 自分のコマでボス犬を囲む（3方向）
        positions = [(1, 0), (0, 1), (2, 1), (3, 1), (3, 2), (3, 3)]
        for x, y in positions:
            Dog.objects.create(
                game=self.game, player=self.player1,
                dog_type=self.dog_type_aniki,
                x_position=x, y_position=y, is_in_hand=False
            )

        # 移動するコマ
        moving_dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_aniki,
            x_position=2, y_position=2, is_in_hand=False
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # 自分のコマを移動してボス犬を囲んでしまう
        response = self.client.post(
            f'/api/dogs/{moving_dog.id}/move/',
            {'x': 1, 'y': 2}
        )

        # 自分のボス犬が囲まれるため、移動は阻止される
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('この移動はあなたのボス犬が囲まれるため、移動できません。', response.data.get('error', ''))
        logger.debug("移動が正しくブロックされました")
        logger.debug("テスト終了: テスト18 - ネガティブチェック")

    def test_cannot_place_piece_if_it_causes_self_boss_surrounded_negative(self):
        """
        テスト19: 自分のボス犬が囲まれる配置を阻止できるかどうか（ネガティブチェック）
        """
        logger.debug("テスト開始: テスト19 - 自分のボス犬が囲まれる配置の阻止 (ネガティブチェック)")
        # プレイヤー1のボス犬を(1,1)に配置
        boss_dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss,
            x_position=1, y_position=1, is_in_hand=False
        )

        # 自分のコマでボス犬を囲む（3方向）
        positions = [(1, 0), (0, 1), (2, 1)]
        for x, y in positions:
            Dog.objects.create(
                game=self.game, player=self.player1,
                dog_type=self.dog_type_aniki,
                x_position=x, y_position=y, is_in_hand=False
            )

        # 手札にある自分のコマを取得
        dog_in_hand = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_aniki,
            is_in_hand=True
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # コマを配置してボス犬を囲んでしまう
        response = self.client.post(
            f'/api/dogs/{dog_in_hand.id}/place_on_board/',
            {'x': 1, 'y': 2}
        )
        # 自分のボス犬が囲まれるため、配置は阻止される
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('この配置はあなたのボス犬が囲まれるため、配置できません。', response.data.get('error', ''))
        logger.debug("配置が正しくブロックされました")
        logger.debug("テスト終了: テスト19 - ネガティブチェック")
        
    def test_player_cannot_surround_own_boss_negative(self):
        """
        テスト20: 特定のボード状態でプレイヤー1が自分のボス犬を囲めないどうか（ネガティブチェック）
        """
        logger.debug("テスト20: 特定のボード状態でプレイヤー1が自分のボス犬を囲めないどうか（ネガティブチェック）")

        # プレイヤー1のボス犬を(0,0)に配置
        boss_dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_boss,
            x_position=0, y_position=0, is_in_hand=False
        )

        moving_dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_yaiba,
            x_position=2, y_position=0, is_in_hand=False
        )

        # プレイヤー2のコマを配置
        positions = [(0, 1), (1, 1), (2, 1), (3, 1), (1, 2), (1, 3)]
        for x, y in positions:
            Dog.objects.create(
                game=self.game, player=self.player2,
                dog_type=self.dog_type_yaiba,
                x_position=x, y_position=y, is_in_hand=False
            )

        # ターンをプレイヤー2に設定
        self.game.current_turn = self.player1
        self.game.save()

        response = self.client.post(
            f'/api/dogs/{moving_dog.id}/move/',
            {'x': 1, 'y': 0}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('この移動はあなたのボス犬が囲まれるため、移動できません。', response.data.get('error', ''))
        logger.debug("移動が正しくブロックされました")
        logger.debug("テスト終了: テスト15 - ポジティブチェック")
