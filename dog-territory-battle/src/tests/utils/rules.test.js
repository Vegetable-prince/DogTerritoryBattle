import {
  check_movement_type,
  check_duplicate,
  check_over_max_board,
  check_no_adjacent,
  check_own_adjacent,
  check_would_lose,
  check_boss_cant_remove,
} from '../../utils/rules';

describe('Rules Utility Functions', () => {
  /**
   * check_movement_type のテスト:
   * コマの移動パターンが正しいかを確認
   */

  // 1. Orthogonal Move (直線移動) - 1ステップ
  test('check_movement_type validates orthogonal movement correctly for 1 step', () => {
    const dog = { movement_type: 'orthogonal', max_steps: 1 };
    const from = { x: 1, y: 1 };
    const to = { x: 1, y: 2 }; // 上方向への移動

    const result = check_movement_type(dog, from, to);
    expect(result).toBe(true);
  });

  // 2. Orthogonal Move (直線移動) - 複数ステップ (トツハトなど)
  test('check_movement_type validates orthogonal movement correctly for multiple steps', () => {
    const dog = { movement_type: 'orthogonal', max_steps: 3 };
    const from = { x: 1, y: 1 };
    const to = { x: 1, y: 4 }; // 下方向に3ステップ移動

    const result = check_movement_type(dog, from, to);
    expect(result).toBe(true);
  });

  // 3. Orthogonal Move (直線移動) - 超過ステップ数
  test('check_movement_type invalidates orthogonal movement exceeding max_steps', () => {
    const dog = { movement_type: 'orthogonal', max_steps: 2 };
    const from = { x: 1, y: 1 };
    const to = { x: 1, y: 4 }; // 下方向に3ステップ移動

    const result = check_movement_type(dog, from, to);
    expect(result).toBe(false);
  });

  // 4. Diagonal Move (斜め移動) - 1ステップ
  test('check_movement_type validates diagonal movement correctly for 1 step', () => {
    const dog = { movement_type: 'diagonal', max_steps: 1 };
    const from = { x: 2, y: 2 };
    const to = { x: 3, y: 3 }; // 右下方向への移動

    const result = check_movement_type(dog, from, to);
    expect(result).toBe(true);
  });

  // 5. Diagonal Move (斜め移動) - 無効な方向
  test('check_movement_type invalidates diagonal movement in invalid direction', () => {
    const dog = { movement_type: 'diagonal', max_steps: 1 };
    const from = { x: 2, y: 2 };
    const to = { x: 4, y: 2 }; // 右方向への移動（直線）

    const result = check_movement_type(dog, from, to);
    expect(result).toBe(false);
  });

  // 6. Diagonal and Orthogonal Move (斜めおよび直線移動) - 1ステップ
  test('check_movement_type validates diagonal and orthogonal movement correctly for 1 step', () => {
    const dog = { movement_type: 'diagonal_orthogonal', max_steps: 1 };
    const from = { x: 0, y: 0 };
    const to1 = { x: 0, y: 1 }; // 上方向への移動
    const to2 = { x: 1, y: 1 }; // 右上方向への移動

    const result1 = check_movement_type(dog, from, to1);
    const result2 = check_movement_type(dog, from, to2);

    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });

  // 7. Diagonal and Orthogonal Move (斜めおよび直線移動) - 無効なステップ
  test('check_movement_type invalidates diagonal and orthogonal movement exceeding max_steps', () => {
    const dog = { movement_type: 'diagonal_orthogonal', max_steps: 1 };
    const from = { x: 0, y: 0 };
    const to = { x: 0, y: 2 }; // 上方向への移動（2ステップ）

    const result = check_movement_type(dog, from, to);
    expect(result).toBe(false);
  });

  // 8. Special Movement (特殊移動) - ハジケハトの特殊パターン
  test('check_movement_type validates special movement correctly for Hajike Hato', () => {
    const dog = { movement_type: 'special_hajike', max_steps: 3 };
    const from = { x: 2, y: 2 };
    const to1 = { x: 4, y: 3 }; // 右2 + 下1
    const to2 = { x: 0, y: 1 }; // 左2 + 上1

    const result1 = check_movement_type(dog, from, to1);
    const result2 = check_movement_type(dog, from, to2);

    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });

  // 9. Special Movement (特殊移動) - ハジケハトの無効なパターン
  test('check_movement_type invalidates special movement incorrectly for Hajike Hato', () => {
    const dog = { movement_type: 'special_hajike', max_steps: 3 };
    const from = { x: 2, y: 2 };
    const to = { x: 3, y: 4 }; // 右1 + 下2 （不正なパターン）

    const result = check_movement_type(dog, from, to);
    expect(result).toBe(false);
  });

  // 10. Invalid Movement Type (無効な移動タイプ)
  test('check_movement_type invalidates movement with undefined movement_type', () => {
    const dog = { movement_type: 'undefined_type', max_steps: 1 };
    const from = { x: 1, y: 1 };
    const to = { x: 1, y: 2 };

    const result = check_movement_type(dog, from, to);
    expect(result).toBe(false);
  });

  // 11. Movement Beyond Board Boundaries (ボード外への移動)
  test('check_movement_type invalidates movement beyond board boundaries', () => {
    const dog = { movement_type: 'orthogonal', max_steps: 1 };
    const from = { x: 0, y: 0 };
    const to = { x: -1, y: 0 }; // 左方向に移動（ボード外）

    const result = check_movement_type(dog, from, to);
    expect(result).toBe(false);
  });

  // 12. No Movement (移動なし)
  test('check_movement_type invalidates when there is no movement', () => {
    const dog = { movement_type: 'orthogonal', max_steps: 1 };
    const from = { x: 1, y: 1 };
    const to = { x: 1, y: 1 }; // 同じ位置

    const result = check_movement_type(dog, from, to);
    expect(result).toBe(false);
  });

  /**
   * check_duplicate のテスト
   */
  test('check_duplicate detects duplicate positions correctly', () => {
    const boardDogs = [{ x: 1, y: 1 }];
    const position = { x: 1, y: 1 };

    const result = check_duplicate(boardDogs, position);
    expect(result).toBe(true);
  });

  /**
   * check_over_max_board のテスト
   */
  test('check_over_max_board detects over max board size', () => {
    const boardDogs = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ];
    const maxSize = 4;

    const result = check_over_max_board(boardDogs, maxSize);
    expect(result).toBe(true);
  });

  /**
   * check_no_adjacent のテスト
   */
  test('check_no_adjacent detects no adjacent dogs', () => {
    const dogPosition = { x: 2, y: 2 };
    const boardDogs = [{ x: 0, y: 0 }];

    const result = check_no_adjacent(dogPosition, boardDogs);
    expect(result).toBe(true);
  });

  /**
   * check_own_adjacent のテスト
   */
  test('check_own_adjacent finds own adjacent dogs', () => {
    const dogPosition = { x: 1, y: 1 };
    const boardDogs = [{ x: 1, y: 2, player: 1 }];
    const playerId = 1;

    const result = check_own_adjacent(dogPosition, boardDogs, playerId);
    expect(result).toBe(true);
  });

  /**
   * check_would_lose のテスト
   */
  test('check_would_lose detects potential loss', () => {
    const gameState = {}; // 適切なゲーム状態を設定
    const result = check_would_lose(gameState);
    expect(result).toBe(false);
  });

  /**
   * check_boss_cant_remove のテスト
   */
  test('check_boss_cant_remove prevents boss removal', () => {
    const dog = { name: 'ボス犬' };
    const result = check_boss_cant_remove(dog);
    expect(result).toBe(true);
  });
});