// src/tests/utils/rules.test.js
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
      const dog = { 
        name: 'ボス犬', 
        dog_type: { 
          movement_type: 'orthogonal', 
          max_steps: 3 
        } 
      };
      const from = { x: 0, y: 0 };
      const to = { x: 4, y: 0 }; // 4ステップ移動 (400px)

      const result = check_movement_type(dog, from, to);
      expect(result).toBe(false);
    });

    test('invalidates diagonal movement exceeding max_steps', () => {
      const dog = { 
        name: 'アニキ犬', 
        dog_type: { 
          movement_type: 'diagonal', 
          max_steps: 5 
        } 
      };
      const from = { x: 0, y: 0 };
      const to = { x: 6, y: 6 }; // 6ステップ移動 (600px)

      const result = check_movement_type(dog, from, to);
      expect(result).toBe(false);
    });

    test('validates special movement correctly for Hajike Hato', () => {
      const dog = { 
        name: 'ハジケハト', 
        dog_type: { 
          movement_type: 'special_hajike', 
          max_steps: 2 
        } 
      };
      const from = { x: 2, y: 2 };
      const to1 = { x: 4, y: 3 }; // (2,2) -> (4,3): dx=200px, dy=100px
      const to2 = { x: 0, y: 1 }; // (2,2) -> (0,1): dx=200px, dy=100px

      const result1 = check_movement_type(dog, from, to1);
      const result2 = check_movement_type(dog, from, to2);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    test('invalidates movement beyond board boundaries', () => {
      const dog = { 
        name: 'ボス犬', 
        dog_type: { 
          movement_type: 'orthogonal', 
          max_steps: 3 
        } 
      };
      const from = { x: 0, y: 0 };
      const to = { x: -1, y: 0 }; // ボード外 (左に1ステップ)

      const result = check_movement_type(dog, from, to);
      expect(result).toBe(false);
    });

    test('invalidates when there is no movement', () => {
      const dog = { 
        name: 'アニキ犬', 
        dog_type: { 
          movement_type: 'diagonal', 
          max_steps: 5 
        } 
      };
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

    test('handles non-array boardDogs gracefully', () => {
      const boardDogs = null;
      const maxSize = 5;

      const result = check_over_max_board(boardDogs, maxSize);
      expect(result).toBe(false);
    });
  });

  /**
   * check_no_adjacent のテスト
   */
  describe('check_no_adjacent', () => {
    test('check_no_adjacent detects no adjacent dogs', () => {
      const dog = { id: 1, name: 'アニキ犬', left: 200, top: 200 };
      const boardDogs = [{ id: 2, name: 'ボス犬', left: 0, top: 0 }];

      const result = check_no_adjacent(dog, boardDogs);
      expect(result).toBe(true);
    });

    test('check_no_adjacent detects adjacent dogs', () => {
      const dog = { id: 1, name: 'アニキ犬', left: 200, top: 200 };
      const boardDogs = [
        { id: 2, name: 'ボス犬', left: 200, top: 100 },
        { id: 3, name: 'ボス犬', left: 300, top: 200 },
      ];

      const result = check_no_adjacent(dog, boardDogs);
      expect(result).toBe(false);
    });

    test('check_no_adjacent handles non-array boardDogs gracefully', () => {
      const dog = { id: 1, name: 'アニキ犬', left: 200, top: 200 };
      const boardDogs = null;

      const result = check_no_adjacent(dog, boardDogs);
      expect(result).toBe(true);
    });
  });

  /**
   * check_own_adjacent のテスト
   */
  describe('check_own_adjacent', () => {
    test('finds own adjacent dogs correctly', () => {
      const dogPosition = { x: 2, y: 2 };
      const boardDogs = [
        { id: 2, left: 300, top: 200, player: 1 }, // x=3, y=2
        { id: 3, left: 200, top: 300, player: 1 }, // x=2, y=3
      ];
      const playerId = 1;

      const result = check_own_adjacent(dogPosition, boardDogs, playerId);
      expect(result).toBe(true);
    });

    test('does not find own adjacent dogs when none are adjacent', () => {
      const dogPosition = { x: 2, y: 2 };
      const boardDogs = [
        { id: 2, left: 400, top: 400, player: 1 }, // x=4, y=4
        { id: 3, left: 500, top: 500, player: 1 }, // x=5, y=5
      ];
      const playerId = 1;

      const result = check_own_adjacent(dogPosition, boardDogs, playerId);
      expect(result).toBe(false);
    });

    test('check_own_adjacent ignores dogs from other players', () => {
      const dogPosition = { x: 2, y: 2 };
      const boardDogs = [
        { id: 2, name: 'ボス犬', left: 300, top: 200, player: 2 }, // x=3, y=2 (異なるプレイヤー)
        { id: 3, name: 'ボス犬', left: 200, top: 300, player: 3 }, // x=2, y=3 (異なるプレイヤー)
      ];
      const playerId = 1;

      const result = check_own_adjacent(dogPosition, boardDogs, playerId);
      expect(result).toBe(false);
    });

    test('check_own_adjacent handles non-array boardDogs gracefully', () => {
      const dogPosition = { x: 2, y: 2 };
      const boardDogs = null;
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
      expect(result).toBe(false); // ボス犬は削除できないため false
    });

    test('allows removal of non-boss dogs', () => {
      const dog = { name: 'アニキ犬' };
      const result = check_boss_cant_remove(dog);
      expect(result).toBe(true); // 非ボス犬は削除できるため true
    });

    test('allows removal when dog name is undefined', () => {
      const dog = { };
      const result = check_boss_cant_remove(dog);
      expect(result).toBe(true); // 名前がない場合は削除を許可
    });
  });

  /**
   * check_would_lose のテスト
   */
  describe('check_would_lose', () => {
    test('check_would_lose detects potential loss', () => {
      const dog = { name: 'アニキ犬' };
      const result = check_would_lose(dog);
      expect(result).toBe(false); // 仮実装では常に false
    });
  });
});