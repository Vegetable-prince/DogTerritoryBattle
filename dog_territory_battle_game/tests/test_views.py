from .base_test import BaseTestCase
from rest_framework.test import APIClient
from rest_framework import status
from dog_territory_battle_game.models import Dog
from django.urls import reverse

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
        url = f'/api/dogs/{opponent_dog.id}/move/'
        response = self.client.post(url, {'x': 0, 'y': 1})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('まだあなたのターンではありません！', response.data.get('error', ''))

    def test_turn_switches_after_each_operation(self):
        """
        要件2: 各プレイヤーがコマの操作を一度行うたびに、もう片方のプレイヤーのターンに移るかどうか
        """
        # プレイヤー1のコマを手札からフィールドに配置
        dog = Dog.objects.create(
            game=self.game, player=self.player1,
            dog_type=self.dog_type_yaiba, is_in_hand=True
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
        movement_tests = [
            # (犬種, 初期位置, 有効な移動先, 無効な移動先)
            (self.dog_type_boss, (0, 1), (0, 0), (1, 2)),  # ボス犬
            (self.dog_type_aniki, (1, 0), (0, 1), (3, 3)),  # アニキ犬
            (self.dog_type_yaiba, (0, 2), (1, 2), (2, 1)),  # ヤイバ犬
            (self.dog_type_mame, (1, 1), (2, 2), (3, 2)),  # 豆でっぽう犬
            (self.dog_type_totsu, (3, 0), (3, 1), (2, 3)),  # トツ犬
            (self.dog_type_hajike, (2, 0), (3, 2), (0, 2)),  # ハジケ犬
        ]

        # 全てのコマを初期位置に配置
        dogs = []
        for dog_type, start_pos, _, _ in movement_tests:
            dog = Dog.objects.create(
                game=self.game, player=self.player1,
                dog_type=dog_type,
                x_position=start_pos[0], y_position=start_pos[1], is_in_hand=False
            )
            dogs.append(dog)

        # 配置後のコマの位置をログに出力
        dogs_on_board = Dog.objects.filter(game=self.game, is_in_hand=False)
        positions = [(d.dog_type.name, d.x_position, d.y_position) for d in dogs_on_board]
        print(f"All dogs placed: {positions}")

        # 各犬種ごとにテストを実施
        for index, (dog_type, _, valid_move, invalid_move) in enumerate(movement_tests):
            dog = dogs[index]

            with self.subTest(dog_type=dog_type.name):
                # 有効な移動
                response = self.client.post(
                    f'/api/dogs/{dog.id}/move/',
                    {'x': valid_move[0], 'y': valid_move[1]}
                )
                self.assertEqual(response.status_code, status.HTTP_200_OK, msg=f"Valid move failed for {dog_type.name}")

                # 移動後のコマの位置をログに出力
                dogs_on_board = Dog.objects.filter(game=self.game, is_in_hand=False)
                positions = [(d.dog_type.name, d.x_position, d.y_position) for d in dogs_on_board]
                print(f"After moving {dog_type.name} to {valid_move}: {positions}")

                # ターンを再度プレイヤー1に戻す
                self.game.current_turn = self.player1
                self.game.save()

                # 無効な移動を試みる
                response = self.client.post(
                    f'/api/dogs/{dog.id}/move/',
                    {'x': invalid_move[0], 'y': invalid_move[1]}
                )
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, msg=f"Invalid move did not fail for {dog_type.name}")
                self.assertIn('この犬種では無効な移動です。', response.data['error'], msg=f"Incorrect error message for {dog_type.name}")

                # ターンを再度プレイヤー1に戻す
                self.game.current_turn = self.player1
                self.game.save()

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
        self.assertIn('そのマスには既にコマがあります。', response.data['error'])

        # ターンを再度プレイヤー1に戻す
        self.game.current_turn = self.player1
        self.game.save()

        # dog2を別の場所に配置
        response = self.client.post(
            f'/api/dogs/{dog2.id}/place_on_board/',
            {'x': 1, 'y': 0}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # dog1をdog2の位置に移動させようとする（移動先が既に埋まっている）
        self.game.current_turn = self.player1
        self.game.save()

        response = self.client.post(
            f'/api/dogs/{dog1.id}/move/',
            {'x': 1, 'y': 0}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('そのマスには既にコマがあります。', response.data['error'])

    def test_move_if_adjacent_after_move(self):
        """
        要件6: コマを移動した後に他のコマと隣接している場合は移動できるかどうか
        """
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

        # dog1を(1,1)に移動させる（移動後もdog2と隣接）
        response = self.client.post(
            f'/api/dogs/{dog1.id}/move/',
            {'x': 1, 'y': 1}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, "移動が成功しました。")

        # 再度ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # dog1を(2,2)に移動させる（移動後、他のコマと隣接しない）
        response = self.client.post(
            f'/api/dogs/{dog1.id}/move/',
            {'x': 2, 'y': 2}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "隣接していない場所への移動が拒否されませんでした。")
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
            x_position=0, y_position=1, is_in_hand=False
        )

        # ターンをプレイヤー1に設定
        self.game.current_turn = self.player1
        self.game.save()

        # コマを手札に戻そうとする
        response = self.client.post(
            f'/api/dogs/{dog2.id}/remove_from_board/'
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
        self.assertIn('フィールドのサイズを超えるため移動できません。', response.data['error'])

        # ターンを再度プレイヤー1に戻す
        self.game.current_turn = self.player1
        self.game.save()

        # 横に4マスを超えるテスト（x=5に移動）
        response = self.client.post(
            f'/api/dogs/{boss_dog.id}/move/',
            {'x': 5, 'y': 4}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('フィールドのサイズを超えるため移動できません。', response.data['error'])
