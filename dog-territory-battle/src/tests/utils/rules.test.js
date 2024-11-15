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
   * check_movement_type のテスト
   */
  describe('check_movement_type', () => {
    test('invalidates orthogonal movement exceeding max_steps', () => {
      const dog = { name: 'ボス犬', dog_type: { movement_type: '歩行', max_steps: 3 } };
      const from = { x: 0, y: 0 };
      const to = { x: 4, y: 0 }; // 4ステップ移動

      const result = check_movement_type(dog, from, to);
      expect(result).toBe(false);
    });

    test('invalidates diagonal and orthogonal movement exceeding max_steps', () => {
      const dog = { name: 'アニキ犬', dog_type: { movement_type: '走行', max_steps: 5 } };
      const from = { x: 0, y: 0 };
      const to = { x: 6, y: 6 }; // 6ステップ移動

      const result = check_movement_type(dog, from, to);
      expect(result).toBe(false);
    });

    test('validates special movement correctly for Hajike Hato', () => {
      const dog = { name: 'ハジケハト', dog_type: { movement_type: '特殊', max_steps: 2 } };
      const from = { x: 0, y: 0 };
      const to1 = { x: 1, y: 1 }; // 1ステップ
      const to2 = { x: 2, y: 2 }; // 2ステップ

      const result1 = check_movement_type(dog, from, to1);
      const result2 = check_movement_type(dog, from, to2);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    test('invalidates movement beyond board boundaries', () => {
      const dog = { name: 'ボス犬', dog_type: { movement_type: '歩行', max_steps: 3 } };
      const from = { x: 0, y: 0 };
      const to = { x: -1, y: 0 }; // ボード外

      const result = check_movement_type(dog, from, to);
      expect(result).toBe(false);
    });

    test('invalidates when there is no movement', () => {
      const dog = { name: 'アニキ犬', dog_type: { movement_type: '走行', max_steps: 5 } };
      const from = { x: 1, y: 1 };
      const to = { x: 1, y: 1 };

      const result = check_movement_type(dog, from, to);
      expect(result).toBe(false);
    });
  });

  /**
   * check_duplicate のテスト
   */
  describe('check_duplicate', () => {
    test('detects duplicate positions correctly', () => {
      const dog = { id: 1, left: 100, top: 100 };
      const boardDogs = [
        { id: 2, left: 100, top: 100 },
        { id: 3, left: 200, top: 200 },
      ];

      const result = check_duplicate(dog, boardDogs);
      expect(result).toBe(true);
    });

    test('does not detect duplicate when positions are unique', () => {
      const dog = { id: 1, left: 100, top: 100 };
      const boardDogs = [
        { id: 2, left: 150, top: 150 },
        { id: 3, left: 200, top: 200 },
      ];

      const result = check_duplicate(dog, boardDogs);
      expect(result).toBe(false);
    });

    test('handles empty boardDogs array correctly', () => {
      const dog = { id: 1, left: 100, top: 100 };
      const boardDogs = [];

      const result = check_duplicate(dog, boardDogs);
      expect(result).toBe(false);
    });

    test('handles non-array boardDogs gracefully', () => {
      const dog = { id: 1, left: 100, top: 100 };
      const boardDogs = null;

      const result = check_duplicate(dog, boardDogs);
      expect(result).toBe(false);
    });
  });

  /**
   * check_over_max_board のテスト
   */
  describe('check_over_max_board', () => {
    test('detects over max board size correctly', () => {
      const boardDogs = new Array(10).fill({ id: 1, name: 'ボス犬', left: 100, top: 100 });
      const maxSize = 5;

      const result = check_over_max_board(boardDogs, maxSize);
      expect(result).toBe(true);
    });

    test('does not detect over max board size when under limit', () => {
      const boardDogs = new Array(4).fill({ id: 1, name: 'ボス犬', left: 100, top: 100 });
      const maxSize = 5;

      const result = check_over_max_board(boardDogs, maxSize);
      expect(result).toBe(false);
    });
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
  describe('check_own_adjacent', () => {
    test('finds own adjacent dogs correctly', () => {
      const dogPosition = { x: 2, y: 2 };
      const boardDogs = [
        { id: 1, left: 3, top: 2, player: 1 },
        { id: 2, left: 2, top: 3, player: 1 },
      ];
      const playerId = 1;

      const result = check_own_adjacent(dogPosition, boardDogs, playerId);
      expect(result).toBe(true);
    });

    test('does not find own adjacent dogs when none are adjacent', () => {
      const dogPosition = { x: 2, y: 2 };
      const boardDogs = [
        { id: 1, left: 4, top: 4, player: 1 },
        { id: 2, left: 5, top: 5, player: 1 },
      ];
      const playerId = 1;

      const result = check_own_adjacent(dogPosition, boardDogs, playerId);
      expect(result).toBe(false);
    });
  });

  /**
   * check_boss_cant_remove のテスト
   */
  describe('check_boss_cant_remove', () => {
    test('prevents boss removal', () => {
      const dog = { name: 'ボス犬' };
      const result = check_boss_cant_remove(dog);
      expect(result).toBe(true);
    });

    test('allows removal of non-boss dogs', () => {
      const dog = { name: 'アニキ犬' };
      const result = check_boss_cant_remove(dog);
      expect(result).toBe(false);
    });
  });

  /**
   * check_would_lose のテスト
   */
  test('check_would_lose detects potential loss', () => {
    const gameState = {}; // 適切なゲーム状態を設定
    const result = check_would_lose(gameState);
    expect(result).toBe(false);
  });
});