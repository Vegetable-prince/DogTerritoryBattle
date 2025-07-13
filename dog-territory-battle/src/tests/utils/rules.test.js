import {
  applyHandRules,
  applyBoardRules,
} from '../../utils/rules';

describe('Rules Utility Functions', () => {

  /**
   * 手札のコマを選択した場合のテスト
   */
  describe('Hand Area Rules', () => {
    test('ボード上にプレイヤー1のボスが(1, 2)、プレイヤー2のボスが(1, 1)の場合、手札のcorgiの置ける場所を確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'bulldog',
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
          name: 'bulldog',
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
        name: 'corgi',
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

    test('ボード上にプレイヤー1のボスが(0, 0)、プレイヤー2のボスが(0, 1)の場合、手札のcorgiの置ける場所を確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'bulldog',
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
          name: 'bulldog',
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
        name: 'corgi',
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

    test('ボード上にプレイヤー1のボスが(0, 0)、プレイヤー2のボスが(0, 1)、プレイヤー2のcorgiが(1, 0)、プレイヤー2のhuskyが(-1, 0)の場合、手札のcorgiの置ける場所を確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'bulldog',
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
          name: 'bulldog',
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
          name: 'corgi',
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
          name: 'husky',
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
        name: 'corgi',
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

    test('ボード上にプレイヤー1のボスが(0, 0)、プレイヤー2のボスが(0, 1)、プレイヤー2のcorgiが(1, 2)、プレイヤー2のhuskyが(2, 3)、プレイヤー2のshibaが(1, 0)の場合、手札のcorgiの置ける場所を確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'bulldog',
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
          name: 'bulldog',
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
          name: 'corgi',
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
          name: 'husky',
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
          name: 'shiba',
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
        name: 'corgi',
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
    test('ボード上の(0, 0)のプレイヤー1のbulldogの移動可能マスを確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'bulldog',
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
          name: 'bulldog',
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

    test('ボード上の(1, 0)のプレイヤー1のhuskyの移動可能マスを確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'bulldog',
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
          name: 'bulldog',
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
          name: 'husky',
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

    test('ボード上の(1, 0)のプレイヤー1のshibaの移動可能マスを確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'bulldog',
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
          name: 'bulldog',
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
          name: 'shiba',
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

    test('ボード上の(1, 0)のプレイヤー1のshepherdの移動可能マスを確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'bulldog',
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
          name: 'bulldog',
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
          name: 'shepherd',
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

    test('ボード上の(1, 0)のプレイヤー1のraccoonの移動可能マスを確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'bulldog',
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
          name: 'bulldog',
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
          name: 'raccoon',
          x_position: 1,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'special',
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

    test('ボード上にプレイヤー1のボスが(1, 2)、プレイヤー2のボスが(1, 1)、プレイヤー1のcorgiが(2, 0)の場合、corgiの移動先を確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'bulldog',
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
          name: 'bulldog',
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
          name: 'corgi',
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

    test('ボード上にプレイヤー1のボスが(0, 0)、プレイヤー2のボスが(0, 1)、プレイヤー1のcorgiが(1, 0)の場合、corgiの移動先を確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'bulldog',
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
          name: 'bulldog',
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
          name: 'corgi',
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

    test('ボード上に(0, 0)のプレイヤー1のbulldog、(0, 1)のプレイヤー2のbulldog、(1, 0)のプレイヤー2のcorgi、(-1, 0)のプレイヤー2のhusky、(1, -1)のプレイヤー1のcorgiがある場合、プレイヤー1のcorgiの移動先を確認する', () => {
      const boardDogs = [
        // プレイヤー1のbulldog
        {
          id: 1,
          name: 'bulldog',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー2のbulldog
        {
          id: 2,
          name: 'bulldog',
          x_position: 0,
          y_position: 1,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー2のcorgi
        {
          id: 3,
          name: 'corgi',
          x_position: 1,
          y_position: 0,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー2のhusky
        {
          id: 4,
          name: 'husky',
          x_position: -1,
          y_position: 0,
          player: 2,
          dog_type: {
            movement_type: 'orthogonal',
            max_steps: null,
          },
        },
        // プレイヤー1のcorgi（選択したコマ）
        {
          id: 5,
          name: 'corgi',
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

    test('ボード上に(0, 0)のプレイヤー1のbulldog、(2, 0)のプレイヤー1のcorgi、(2, 2)のプレイヤー1のshiba、(1, 0)のプレイヤー1のhusky、(0, 1)のプレイヤー2のbulldog、(1, 2)のプレイヤー2のcorgi、(3, 0)のプレイヤー2のhusky、プレイヤー1のshibaの移動先を確認する', () => {
      const boardDogs = [
        // プレイヤー1のbulldog
        {
          id: 1,
          name: 'bulldog',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー1のcorgi
        {
          id: 2,
          name: 'corgi',
          x_position: 2,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー1のshiba（選択したコマ）
        {
          id: 3,
          name: 'shiba',
          x_position: 2,
          y_position: 2,
          player: 1,
          dog_type: {
            movement_type: 'diagonal',
            max_steps: 1,
          },
        },
        // プレイヤー1のhusky
        {
          id: 4,
          name: 'husky',
          x_position: 1,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'orthogonal',
            max_steps: null,
          },
        },
        // プレイヤー2のbulldog
        {
          id: 5,
          name: 'bulldog',
          x_position: 0,
          y_position: 1,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー2のcorgi
        {
          id: 6,
          name: 'corgi',
          x_position: 1,
          y_position: 2,
          player: 2,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー2のhusky
        {
          id: 7,
          name: 'husky',
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

    test('bulldogを削除できないことを確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'bulldog',
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

    test('bulldog以外のコマを削除できることを確認する', () => {
      const boardDogs = [
        {
          id: 1,
          name: 'bulldog',
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
          name: 'bulldog',
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
          name: 'corgi',
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
          name: 'corgi',
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

    test('ボード上に（0, 0)のプレイヤー1のbulldog、(1, -1)のプレイヤー1のcorgi、(1, -2)のプレイヤー2のbulldogがある場合、プレイヤー1のcorgiの移動先を確認する（孤立を避ける）', () => {
      const boardDogs = [
        // プレイヤー1のbulldog
        {
          id: 1,
          name: 'bulldog',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー1のcorgi（選択したコマ）
        {
          id: 2,
          name: 'corgi',
          x_position: 1,
          y_position: -1,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー2のbulldog
        {
          id: 3,
          name: 'bulldog',
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

    test('ボード上に（0, 0)のプレイヤー1のbulldog、(1, -1)のプレイヤー1のcorgi、(1, -2)のプレイヤー2のbulldogがある場合、プレイヤー1のcorgiは手札に戻せないことを確認する（孤立を避ける）', () => {
      const boardDogs = [
        // プレイヤー1のbulldog
        {
          id: 1,
          name: 'bulldog',
          x_position: 0,
          y_position: 0,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー1のcorgi（選択したコマ）
        {
          id: 2,
          name: 'corgi',
          x_position: 1,
          y_position: -1,
          player: 1,
          dog_type: {
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
        },
        // プレイヤー2のbulldog
        {
          id: 3,
          name: 'bulldog',
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
