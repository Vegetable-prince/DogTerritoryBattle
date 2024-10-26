// src/utils/rules.test.js

import {
  generateValidMoves,
  generateValidMovesForHandPiece,
  checkWinner,
  shouldAddSpace,
} from './rules';

describe('Rules Utility Functions', () => {
  /**
   * 要件4:
   * 各コマはその movement_type に従った行動しか取れないかどうか
   */
  test('generateValidMoves returns correct moves based on movement_type', () => {
    const dog = {
      left: 0,
      top: 0,
      movement_type: 'orthogonal',
      max_steps: 1,
    };
    const boardDogs = [];
    const boardBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const moves = generateValidMoves(dog, boardDogs, boardBounds);

    expect(moves).toEqual([
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ]);
  });

  /**
   * 要件5:
   * すでにコマがあるマスには移動できないかどうか
   */
  test('generateValidMoves excludes squares that already have a piece', () => {
    const dog = {
      left: 0,
      top: 0,
      movement_type: 'orthogonal',
      max_steps: 1,
    };
    const boardDogs = [
      { left: 0, top: 100 }, // This position should be excluded
    ];
    const boardBounds = { minX: 0, maxX: 0, minY: 0, maxY: 1 };

    const moves = generateValidMoves(dog, boardDogs, boardBounds);

    expect(moves).toEqual([
      { x: 0, y: -1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ]);
  });

  /**
   * 要件8:
   * コマの操作後にボス犬が囲まれた場合に勝者判定されるかどうか
   */
  test('checkWinner correctly identifies when a Boss Dog is surrounded', () => {
    const game = {
      player1: 1,
      player2: 2,
      dogs: [
        {
          name: 'ボス犬',
          left: 100,
          top: 100,
          player: 1,
        },
        // Surrounding dogs
        { left: 100, top: 0 },
        { left: 100, top: 200 },
        { left: 0, top: 100 },
        { left: 200, top: 100 },
      ],
    };

    const winner = checkWinner(game);
    expect(winner).toBe(2);
  });

  /**
   * 要件10:
   * フィールドの全コマの配置が縦横4マスを超えていないかどうか
   */
  test('generateValidMoves does not allow moves that exceed 4x4 board size', () => {
    const dog = {
      left: 300,
      top: 300,
      movement_type: 'orthogonal',
      max_steps: 1,
    };
    const boardDogs = [
      { left: 0, top: 0 },
      { left: 100, top: 0 },
      { left: 200, top: 0 },
      { left: 300, top: 0 },
    ];
    const boardBounds = { minX: 0, maxX: 300, minY: 0, maxY: 300 };

    const moves = generateValidMoves(dog, boardDogs, boardBounds);

    expect(moves).toEqual([]);
  });

  /**
   * 要件6:
   * 移動後に他のコマと隣接していない場合は移動できないかどうか
   */
  test('generateValidMoves excludes moves that result in no adjacent pieces', () => {
    const dog = {
      left: 0,
      top: 0,
      movement_type: 'orthogonal',
      max_steps: 1,
    };
    const boardDogs = [
      { left: 0, top: 0 },
    ];
    const boardBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const moves = generateValidMoves(dog, boardDogs, boardBounds);

    // Assuming the function is designed to exclude such moves
    expect(moves).toEqual([]);
  });

  // 他の要件についても同様にテストを実装できます
});