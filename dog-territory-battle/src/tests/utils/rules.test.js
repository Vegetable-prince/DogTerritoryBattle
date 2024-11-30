import {
  applyHandRules,
  applyBoardRules,
} from '../../utils/rules';

describe('Rules Utility Functions', () => {

  /**
   * 手札のコマを選択した場合のテスト
   */
  describe('Hand Area Rules', () => {
    test('ボード上にプレイヤー1のボスが(1, 2)、プレイヤー2のボスが(1, 1)の場合、手札のアニキ犬の置ける場所を確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'ボス犬',
          x_position: 1,
          y_position: 2,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 2,
          name: 'ボス犬',
          x_position: 1,
          y_position: 1,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
      ];
      const selectedDog = {
        id: 3,
        name: 'アニキ犬',
        player: 1,
        dog_type: {
          movement_type: 'diagonal_orthogonal',
          max_steps: 1,
        },
      };
      const playerId = 1;

      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };

      const result = applyHandRules(initialData);

      const expectedPositions = [
        { x: 0, y: 2 },
        { x: 0, y: 1 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 1, y: 3 },
        { x: 0, y: 3 },
      ];

      // ソートして比較
      const sortPositions = (positions) => {
        return positions.sort((a, b) => {
          if (a.x !== b.x) {
            return a.x - b.x;
          }
          return a.y - b.y;
        });
      };

      expect(sortPositions(result.candidatePositions)).toEqual(sortPositions(expectedPositions));
    });

    test('ボード上にプレイヤー1のボスが(0, 0)、プレイヤー2のボスが(0, 1)の場合、手札のアニキ犬の置ける場所を確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'ボス犬',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 2,
          name: 'ボス犬',
          x_position: 0,
          y_position: 1,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
      ];
      const selectedDog = {
        id: 3,
        name: 'アニキ犬',
        player: 1,
        dog_type: {
          movement_type: 'diagonal_orthogonal',
          max_steps: 1,
        },
      };
      const playerId = 1;
    
      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };
    
      const result = applyHandRules(initialData);
    
      const expectedPositions = [
        { x: -1, y: 0 },
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: 1, y: -1 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: -1, y: 1 },
      ];

      expect(result.candidatePositions).toEqual(expectedPositions);
    });

    test('ボード上にプレイヤー1のボスが(0, 0)、プレイヤー2のボスが(0, 1)、プレイヤー2のアニキ犬が(1, 0)、プレイヤー2のヤイバ犬が(-1, 0)の場合、手札のアニキ犬の置ける場所を確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'ボス犬',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 2,
          name: 'ボス犬',
          x_position: 0,
          y_position: 1,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 3,
          name: 'アニキ犬',
          x_position: 1,
          y_position: 0,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 4,
          name: 'ヤイバ犬',
          x_position: -1,
          y_position: 0,
          player: 2,
          dog_type: {
            movement_type: 'orthogonal',
            max_steps: null,
          },
        },
      ];
      const selectedDog = {
        id: 5,
        name: 'アニキ犬',
        player: 1,
        dog_type: {
          movement_type: 'diagonal_orthogonal',
          max_steps: 1,
        },
      };
      const playerId = 1;
    
      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };
    
      const result = applyHandRules(initialData);
    
      const expectedPositions = [
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: -1, y: 1 },
        { x: 1, y: 1 },
      ];
    
      // ソートして比較
      const sortPositions = (positions) => {
        return positions.sort((a, b) => {
          if (a.x !== b.x) {
            return a.x - b.x;
          }
          return a.y - b.y;
        });
      };

      expect(sortPositions(result.candidatePositions)).toEqual(sortPositions(expectedPositions));
    });

    test('ボード上にプレイヤー1のボスが(0, 0)、プレイヤー2のボスが(0, 1)、プレイヤー2のアニキ犬が(1, 2)、プレイヤー2のヤイバ犬が(2, 3)、プレイヤー2の豆でっぽう犬が(1, 0)の場合、手札のアニキ犬の置ける場所を確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'ボス犬',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 2,
          name: 'ボス犬',
          x_position: 0,
          y_position: 1,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 3,
          name: 'アニキ犬',
          x_position: 1,
          y_position: 2,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 4,
          name: 'ヤイバ犬',
          x_position: 2,
          y_position: 3,
          player: 2,
          dog_type: {
            movement_type: 'orthogonal',
            max_steps: null,
          },
        },
        {
          id: 5,
          name: '豆でっぽう犬',
          x_position: 1,
          y_position: 0,
          player: 2,
          dog_type: {
            movement_type: 'diagonal',
            max_steps: null,
          },
        },
      ];
      const selectedDog = {
        id: 6,
        name: 'アニキ犬',
        player: 1,
        dog_type: {
          movement_type: 'diagonal_orthogonal',
          max_steps: 1,
        },
      };
      const playerId = 1;
    
      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };
    
      const result = applyHandRules(initialData);
    
      const expectedPositions = [
        { x: -1, y: 1 },
        { x: 1, y: 1 },
      ];
    
      // ソートして比較
      const sortPositions = (positions) => {
        return positions.sort((a, b) => {
          if (a.x !== b.x) {
            return a.x - b.x;
          }
          return a.y - b.y;
        });
      };
    
      expect(sortPositions(result.candidatePositions)).toEqual(sortPositions(expectedPositions));
    });
  });

  /**
   * ボード上のコマを選択した場合のテスト
   */
  describe('Board Rules', () => {
    test('ボード上の(0, 0)のプレイヤー1のボス犬の移動可能マスを確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'ボス犬',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 2,
          name: 'ボス犬',
          x_position: 0,
          y_position: 1,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
      ];
      const selectedDog = boardDogs[0];
      const playerId = 1;
    
      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };
    
      const result = applyBoardRules(initialData);
    
      const expectedPositions = [
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: 1 },
        { x: 1, y: 1 },
      ];
    
      // ソートして比較
      const sortPositions = (positions) => {
        return positions.sort((a, b) => {
          if (a.x !== b.x) {
            return a.x - b.x;
          }
          return a.y - b.y;
        });
      };
    
      expect(sortPositions(result.candidatePositions)).toEqual(sortPositions(expectedPositions));
    });

    test('ボード上の(1, 0)のプレイヤー1のヤイバ犬の移動可能マスを確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'ボス犬',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 2,
          name: 'ボス犬',
          x_position: 0,
          y_position: 1,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 3,
          name: 'ヤイバ犬',
          x_position: 1,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'orthogonal',
            max_steps: 1,
          },
        },
      ];
      const selectedDog = boardDogs[2];
      const playerId = 1;
    
      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };
    
      const result = applyBoardRules(initialData);
    
      const expectedPositions = [
        { x: 1, y: -1 }, // 上
        { x: 1, y: 1 },  // 下
      ];
    
      // ソートして比較
      const sortPositions = (positions) => {
        return positions.sort((a, b) => {
          if (a.x !== b.x) {
            return a.x - b.x;
          }
          return a.y - b.y;
        });
      };
    
      expect(sortPositions(result.candidatePositions)).toEqual(sortPositions(expectedPositions));
    });

    test('ボード上の(1, 0)のプレイヤー1の豆でっぽう犬の移動可能マスを確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'ボス犬',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 2,
          name: 'ボス犬',
          x_position: 0,
          y_position: 1,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 3,
          name: '豆でっぽう犬',
          x_position: 1,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal',
            max_steps: 1, // 修正: max_steps を 1 に設定
          },
        },
      ];
      const selectedDog = boardDogs[2];
      const playerId = 1;
    
      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };
    
      const result = applyBoardRules(initialData);
    
      const expectedPositions = [
        // 左上方向
        { x: 0, y: -1 },
      ];
    
      // ソートして比較
      const sortPositions = (positions) => {
        return positions.sort((a, b) => {
          if (a.x !== b.x) {
            return a.x - b.x;
          }
          return a.y - b.y;
        });
      };
    
      expect(sortPositions(result.candidatePositions)).toEqual(sortPositions(expectedPositions));
    });

    test('ボード上の(1, 0)のプレイヤー1のトツ犬の移動可能マスを確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'ボス犬',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 2,
          name: 'ボス犬',
          x_position: 0,
          y_position: 1,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 3,
          name: 'トツ犬',
          x_position: 1,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'orthogonal',
            max_steps: null,
          },
        },
      ];
      const selectedDog = boardDogs[2];
      const playerId = 1;
    
      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };
    
      const result = applyBoardRules(initialData);
    
      const expectedPositions = [
        // 上方向
        { x: 1, y: -1 },
        // 下方向
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ];
    
      // ソートして比較
      const sortPositions = (positions) => {
        return positions.sort((a, b) => {
          if (a.x !== b.x) {
            return a.x - b.x;
          }
          return a.y - b.y;
        });
      };
    
      expect(sortPositions(result.candidatePositions)).toEqual(sortPositions(expectedPositions));
    });

    test('ボード上の(1, 0)のプレイヤー1のハジケ犬の移動可能マスを確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'ボス犬',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 2,
          name: 'ボス犬',
          x_position: 0,
          y_position: 1,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 3,
          name: 'ハジケ犬',
          x_position: 1,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'special_hajike',
            max_steps: null,
          },
        },
      ];
      const selectedDog = boardDogs[2];
      const playerId = 1;
    
      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };
    
      const result = applyBoardRules(initialData);
    
      const expectedPositions = [
        // 下方向に2マス進み、その後に左右に1マス曲がる
        { x: 0, y: 2 },
        // 左方向に2マス進み、その後に上下に1マス曲がる
        { x: -1, y: -1 },
        { x: -1, y: 1 },
      ];
    
      // ソートして比較
      const sortPositions = (positions) => {
        return positions.sort((a, b) => {
          if (a.x !== b.x) {
            return a.x - b.x;
          }
          return a.y - b.y;
        });
      };
    
      expect(sortPositions(result.candidatePositions)).toEqual(sortPositions(expectedPositions));
    });

    test('ボード上にプレイヤー1のボスが(1, 2)、プレイヤー2のボスが(1, 1)、プレイヤー1のアニキ犬が(2, 0)の場合、アニキ犬の移動先を確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'ボス犬',
          x_position: 1,
          y_position: 2,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 2,
          name: 'ボス犬',
          x_position: 1,
          y_position: 1,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 3,
          name: 'アニキ犬',
          x_position: 2,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
      ];
      const selectedDog = boardDogs[2];
      const playerId = 1;

      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };

      const result = applyBoardRules(initialData);

      const expectedPositions = [
        { x: 1, y: 0 },
        { x: 2, y: 1 },
      ];

      // ソートして比較
      const sortPositions = (positions) => {
        return positions.sort((a, b) => {
          if (a.x !== b.x) {
            return a.x - b.x;
          }
          return a.y - b.y;
        });
      };

      expect(sortPositions(result.candidatePositions)).toEqual(sortPositions(expectedPositions));
    });

    test('ボード上にプレイヤー1のボスが(0, 0)、プレイヤー2のボスが(0, 1)、プレイヤー1のアニキ犬が(1, 0)の場合、アニキ犬の移動先を確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'ボス犬',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 2,
          name: 'ボス犬',
          x_position: 0,
          y_position: 1,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 3,
          name: 'アニキ犬',
          x_position: 1,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
      ];
      const selectedDog = boardDogs[2];
      const playerId = 1;

      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };

      const result = applyBoardRules(initialData);

      const expectedPositions = [
        { x: 1, y: -1 },
        { x: 1, y: 1 }, 
        { x: 0, y: -1 }
      ];

      expect(result.candidatePositions).toEqual(expectedPositions);
    });

    test('ボード上に(0, 0)のプレイヤー1のボス犬、(0, 1)のプレイヤー2のボス犬、(1, 0)のプレイヤー2のアニキ犬、(-1, 0)のプレイヤー2のヤイバ犬、(1, -1)のプレイヤー1のアニキ犬がある場合、プレイヤー1のアニキ犬の移動先を確認する', () => {
      const boardDogs = [
        // プレイヤー1のボス犬
        {
          id: 1,
          name: 'ボス犬',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー2のボス犬
        {
          id: 2,
          name: 'ボス犬',
          x_position: 0,
          y_position: 1,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー2のアニキ犬
        {
          id: 3,
          name: 'アニキ犬',
          x_position: 1,
          y_position: 0,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー2のヤイバ犬
        {
          id: 4,
          name: 'ヤイバ犬',
          x_position: -1,
          y_position: 0,
          player: 2,
          dog_type: {
            movement_type: 'orthogonal',
            max_steps: null,
          },
        },
        // プレイヤー1のアニキ犬（選択したコマ）
        {
          id: 5,
          name: 'アニキ犬',
          x_position: 1,
          y_position: -1,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
      ];
      const selectedDog = boardDogs[4];
      const playerId = 1;

      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };

      const result = applyBoardRules(initialData);

      const expectedPositions = [
        { x: 2, y: -1 },
        { x: 2, y: 0 },
      ];

      // ソートして比較
      const sortPositions = (positions) => {
        return positions.sort((a, b) => {
          if (a.x !== b.x) {
            return a.x - b.x;
          }
          return a.y - b.y;
        });
      };

      expect(sortPositions(result.candidatePositions)).toEqual(sortPositions(expectedPositions));
    });

    test('ボード上に(0, 0)のプレイヤー1のボス犬、(2, 0)のプレイヤー1のアニキ犬、(2, 2)のプレイヤー1の豆でっぽう犬、(1, 0)のプレイヤー1のヤイバ犬、(0, 1)のプレイヤー2のボス犬、(1, 2)のプレイヤー2のアニキ犬、(3, 0)のプレイヤー2のヤイバ犬、プレイヤー1の豆でっぽう犬の移動先を確認する', () => {
      const boardDogs = [
        // プレイヤー1のボス犬
        {
          id: 1,
          name: 'ボス犬',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー1のアニキ犬
        {
          id: 2,
          name: 'アニキ犬',
          x_position: 2,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー1の豆でっぽう犬（選択したコマ）
        {
          id: 3,
          name: '豆でっぽう犬',
          x_position: 2,
          y_position: 2,
          player: 1,
          dog_type: {
            movement_type: 'diagonal',
            max_steps: 1,
          },
        },
        // プレイヤー1のヤイバ犬
        {
          id: 4,
          name: 'ヤイバ犬',
          x_position: 1,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'orthogonal',
            max_steps: null,
          },
        },
        // プレイヤー2のボス犬
        {
          id: 5,
          name: 'ボス犬',
          x_position: 0,
          y_position: 1,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー2のアニキ犬
        {
          id: 6,
          name: 'アニキ犬',
          x_position: 1,
          y_position: 2,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー2のヤイバ犬
        {
          id: 7,
          name: 'ヤイバ犬',
          x_position: 3,
          y_position: 0,
          player: 2,
          dog_type: {
            movement_type: 'orthogonal',
            max_steps: null,
          },
        },
      ];
      const selectedDog = boardDogs[2];
      const playerId = 1;

      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };

      const result = applyBoardRules(initialData);

      const expectedPositions = [
        { x: 1, y: 1 },
        { x: 3, y: 1 },
      ];

      // ソートして比較
      const sortPositions = (positions) => {
        return positions.sort((a, b) => {
          if (a.x !== b.x) {
            return a.x - b.x;
          }
          return a.y - b.y;
        });
      };

      expect(sortPositions(result.candidatePositions)).toEqual(sortPositions(expectedPositions));
    });

    test('ボス犬を削除できないことを確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'ボス犬',
          x_position: 1,
          y_position: 2,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
      ];
      const selectedDog = boardDogs[0];
      const playerId = 1;

      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };

      const result = applyBoardRules(initialData);

      expect(result.canRemove).toBe(false);
    });

    test('ボス犬以外のコマを削除できることを確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'ボス犬',
          x_position: 1,
          y_position: 2,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 2,
          name: 'ボス犬',
          x_position: 2,
          y_position: 2,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        {
          id: 3,
          name: 'アニキ犬',
          x_position: 0,
          y_position: 2,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
      ];
      const selectedDog = boardDogs[2];
      const playerId = 1;

      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };

      const result = applyBoardRules(initialData);

      expect(result.canRemove).toBe(true);
    });

    test('canRemoveがtrueの場合、手札枠もハイライトされる', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'アニキ犬',
          x_position: 1,
          y_position: 2,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
      ];
      const selectedDog = boardDogs[0];
      const playerId = 1;

      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };

      const result = applyBoardRules(initialData);

      expect(result.canRemove).toBe(true);
    });

    test('ボード上に（0, 0)のプレイヤー1のボス犬、(1, -1)のプレイヤー1のアニキ犬、(1, -2)のプレイヤー2のボス犬がある場合、プレイヤー1のアニキ犬の移動先を確認する（孤立を避ける）', () => {
      const boardDogs = [
        // プレイヤー1のボス犬
        {
          id: 1,
          name: 'ボス犬',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー1のアニキ犬（選択したコマ）
        {
          id: 2,
          name: 'アニキ犬',
          x_position: 1,
          y_position: -1,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー2のボス犬
        {
          id: 3,
          name: 'ボス犬',
          x_position: 1,
          y_position: -2,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
      ];

      const selectedDog = boardDogs[1];
      const playerId = 1;

      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };

      const result = applyBoardRules(initialData);

      const expectedPositions = [
        { x: 0, y: -1 }
      ];

      // ソートして比較
      const sortPositions = (positions) => {
        return positions.sort((a, b) => {
          if (a.x !== b.x) {
            return a.x - b.x;
          }
          return a.y - b.y;
        });
      };

      expect(sortPositions(result.candidatePositions)).toEqual(sortPositions(expectedPositions));
    });

    test('ボード上に（0, 0)のプレイヤー1のボス犬、(1, -1)のプレイヤー1のアニキ犬、(1, -2)のプレイヤー2のボス犬がある場合、プレイヤー1のアニキ犬は手札に戻せないことを確認する（孤立を避ける）', () => {
      const boardDogs = [
        // プレイヤー1のボス犬
        {
          id: 1,
          name: 'ボス犬',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー1のアニキ犬（選択したコマ）
        {
          id: 2,
          name: 'アニキ犬',
          x_position: 1,
          y_position: -1,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー2のボス犬
        {
          id: 3,
          name: 'ボス犬',
          x_position: 1,
          y_position: -2,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
      ];

      const selectedDog = boardDogs[1];
      const playerId = 1;

      const initialData = {
        candidatePositions: [],
        boardDogs,
        selectedDog,
        playerId,
      };

      const result = applyBoardRules(initialData);

      expect(result.canRemove).toBe(false);
    });
  });
});