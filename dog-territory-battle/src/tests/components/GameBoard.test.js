// src/tests/components/GameBoard.test.js

import React from 'react';
import { render, fireEvent, waitFor, screen, within } from '@testing-library/react';
import GameBoard from '../../components/GameJs/GameBoard';
import '@testing-library/jest-dom';

// ルール関数のモック
jest.mock('../../utils/rules', () => ({
  check_movement_type: jest.fn(),
  check_duplicate: jest.fn(),
  check_over_max_board: jest.fn(),
  check_no_adjacent: jest.fn(),
  check_own_adjacent: jest.fn(),
  check_would_lose: jest.fn(),
  check_boss_cant_remove: jest.fn(),
}));

import * as rules from '../../utils/rules';

describe('GameBoard Component', () => {
  // モック関数の作成
  const mockMoveRequest = jest.fn();
  const mockRemoveFromBoardRequest = jest.fn();
  const mockPlaceOnBoardRequest = jest.fn();
  const mockResetGameRequest = jest.fn();
  const mockUndoMoveRequest = jest.fn();
  const mockOnClose = jest.fn(); // WinnerModal の onClose 用

  // operationRequest オブジェクトの作成
  const mockOperationRequest = {
    move_request: mockMoveRequest,
    remove_from_board_request: mockRemoveFromBoardRequest,
    place_on_board_request: mockPlaceOnBoardRequest,
    reset_game_request: mockResetGameRequest,
    undo_move_request: mockUndoMoveRequest,
  };

  beforeEach(() => {
    // ルール関数のデフォルトの動作を設定
    rules.check_duplicate.mockReturnValue(false);
    rules.check_over_max_board.mockReturnValue(false);
    rules.check_own_adjacent.mockReturnValue(true);
    rules.check_would_lose.mockReturnValue(false);
    rules.check_movement_type.mockReturnValue(true);
    rules.check_no_adjacent.mockReturnValue(true);
    rules.check_boss_cant_remove.mockReturnValue(true);

    jest.clearAllMocks();
  });

  /**
   * モックデータの作成
   */
  const mockInitialDataWithWinner = {
    game: {
      current_turn: 1,
      id: 1,
      player1: 1,
      player2: 2,
      winner: null, // ゲーム終了時に setWinner が設定される via useEffect
    },
    player1_hand_dogs: [
      {
        id: 1,
        name: 'ボス犬',
        left: 100,
        top: 100,
        is_in_hand: true,
        dog_type: {
          id: 1,
          name: 'ボス犬',
          movement_type: '歩行',
          max_steps: 3,
        },
        player: 1,
      },
      {
        id: 2,
        name: 'アニキ犬',
        left: 200,
        top: 200,
        is_in_hand: true,
        dog_type: {
          id: 2,
          name: 'アニキ犬',
          movement_type: '走行',
          max_steps: 5,
        },
        player: 1,
      },
    ],
    player2_hand_dogs: [
      {
        id: 3,
        name: 'ヤイバト',
        left: 300,
        top: 300,
        is_in_hand: true,
        dog_type: {
          id: 3,
          name: 'ヤイバト',
          movement_type: '飛行',
          max_steps: 4,
        },
        player: 2,
      },
    ],
    board_dogs: [
      // 'ボス犬' を含まない, causing `WinnerModal` to be rendered
      {
        id: 5,
        name: 'アニキ犬',
        left: 200,
        top: 200,
        is_in_hand: false,
        dog_type: {
          id: 2,
          name: 'アニキ犬',
          movement_type: '走行',
          max_steps: 5,
        },
        player: 2,
      },
    ],
  };

  const mockInitialDataWithoutWinner = {
    game: {
      current_turn: 1,
      id: 1,
      player1: 1,
      player2: 2,
      winner: null,
    },
    player1_hand_dogs: [
      {
        id: 1,
        name: 'ボス犬',
        left: 100,
        top: 100,
        is_in_hand: true,
        dog_type: {
          id: 1,
          name: 'ボス犬',
          movement_type: '歩行',
          max_steps: 3,
        },
        player: 1,
      },
      {
        id: 2,
        name: 'アニキ犬',
        left: 200,
        top: 200,
        is_in_hand: true,
        dog_type: {
          id: 2,
          name: 'アニキ犬',
          movement_type: '走行',
          max_steps: 5,
        },
        player: 1,
      },
    ],
    player2_hand_dogs: [
      {
        id: 3,
        name: 'ヤイバト',
        left: 300,
        top: 300,
        is_in_hand: true,
        dog_type: {
          id: 3,
          name: 'ヤイバト',
          movement_type: '飛行',
          max_steps: 4,
        },
        player: 2,
      },
    ],
    board_dogs: [
      {
        id: 4,
        name: 'ボス犬',
        left: 100,
        top: 100,
        is_in_hand: false,
        dog_type: {
          id: 1,
          name: 'ボス犬',
          movement_type: '歩行',
          max_steps: 3,
        },
        player: 1,
      },
      {
        id: 5,
        name: 'アニキ犬',
        left: 200,
        top: 200,
        is_in_hand: false,
        dog_type: {
          id: 2,
          name: 'アニキ犬',
          movement_type: '走行',
          max_steps: 5,
        },
        player: 2,
      },
    ],
  };

  /**
   * 子コンポーネントのレンダリング確認
   */
  test('renders all child components correctly', () => {
    render(<GameBoard initialData={mockInitialDataWithoutWinner} operationRequest={mockOperationRequest} rulesFunction={rules} />); // No winner, `ExtraOperation` should be rendered

    // HandArea コンポーネントがレンダリングされていることを確認
    const handArea1 = screen.getByTestId('hand-area-player-1');
    expect(handArea1).toBeInTheDocument();

    // Board コンポーネントがレンダリングされていることを確認
    const board = screen.getByTestId('game-board');
    expect(board).toBeInTheDocument();

    // WinnerModal コンポーネントがレンダリングされていないことを確認
    const winnerModal = screen.queryByTestId('winner-modal');
    expect(winnerModal).not.toBeInTheDocument();

    // ShowCurrentTurn コンポーネントがレンダリングされていることを確認
    const currentTurn = screen.getByTestId('current-turn');
    expect(currentTurn).toBeInTheDocument();

    // // ExtraOperation コンポーネントがレンダリングされていることを確認
    // const extraOperation = screen.getByTestId('extra-operation');
    // expect(extraOperation).toBeInTheDocument();
  });

  /**
   * WinnerModal の表示確認
   */
  /**
 * WinnerModal の表示確認
 */
  test('displays WinnerModal when a winner is determined', async () => {
    render(
      <GameBoard
        initialData={mockInitialDataWithWinner}
        operationRequest={mockOperationRequest}
        rulesFunction={rules}
      />
    ); // WinnerModal が表示される

    // WinnerModal が正しく表示されていることを確認
    const winnerModal = screen.getByTestId('winner-modal');
    expect(winnerModal).toBeInTheDocument();

    // WinnerModal 内の p 要素のテキストを確認
    const winnerText = within(winnerModal).getByText('おめでとうございます、Player 2さんが勝ちました！');
    expect(winnerText).toBeInTheDocument();

    // 閉じるボタンが存在することを確認
    const closeButton = within(winnerModal).getByText('閉じる');
    expect(closeButton).toBeInTheDocument();

    // 閉じるボタンをクリック: WinnerModal が閉じられることを確認
    fireEvent.click(closeButton);

    // WinnerModal が閉じられたことを確認
    await waitFor(() => {
      expect(screen.queryByTestId('winner-modal')).not.toBeInTheDocument();
    });
  });

  /**
   * ShowCurrentTurn の表示確認
   */
  test('displays current turn correctly', () => {
    render(<GameBoard initialData={mockInitialDataWithoutWinner} operationRequest={mockOperationRequest} rulesFunction={rules} />); // Turn は Player 1

    const currentTurn = screen.getByTestId('current-turn');
    expect(currentTurn).toBeInTheDocument();

    // 現在のターンが Player 1 であることを確認
    expect(currentTurn).toHaveTextContent('現在のターン: Player 1');
  });

  // /**
  //  * ExtraOperation の動作確認
  //  */
  // test('handles ExtraOperation buttons correctly', () => {
  //   render(<GameBoard initialData={mockInitialDataWithoutWinner} operationRequest={mockOperationRequest} rulesFunction={rules} />); // ExtraOperation を含む

  //   const resetButton = screen.getByTestId('reset-button');
  //   const undoButton = screen.getByTestId('undo-button');

  //   // リセットボタンをクリック: reset_game_request が呼ばれることを確認
  //   fireEvent.click(resetButton);
  //   expect(mockResetGameRequest).toHaveBeenCalled();

  //   // 巻き戻しボタンをクリック: undo_move_request が呼ばれることを確認
  //   fireEvent.click(undoButton);
  //   expect(mockUndoMoveRequest).toHaveBeenCalled();
  // });

  /**
   * Dog コンポーネントのクリックが HandArea と Board に正しく伝達されるか確認
   */
  test('handles click counts correctly in Board - move action', async () => {
    render(
      <GameBoard
        initialData={mockInitialDataWithoutWinner}
        operationRequest={mockOperationRequest}
        rulesFunction={rules}
      />
    );

    const bossDog = screen.getByTestId('dog-4'); // 'ボス犬'
    const anikiDog = screen.getByTestId('dog-5'); // 'アニキ犬'

    // 1度目のクリック: 'ボス犬' を選択
    fireEvent.click(bossDog);
    expect(rules.check_movement_type).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ボス犬' }),
      { move: { x: 1, y: 1 } }
    );
    expect(rules.check_duplicate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ボス犬' }),
      { move: { x: 1, y: 1 } }
    );
    expect(rules.check_over_max_board).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ボス犬' }),
      { move: { x: 1, y: 1 } }
    );
    expect(rules.check_no_adjacent).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ボス犬' }),
      { move: { x: 1, y: 1 } }
    );
    expect(rules.check_boss_cant_remove).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ボス犬' }),
      { move: { x: 1, y: 1 } }
    );

    // 2度目のクリック: 異なる犬 'アニキ犬' をクリックして移動
    fireEvent.click(anikiDog);
    await waitFor(() => {
      expect(mockMoveRequest).toHaveBeenCalledWith(
        mockInitialDataWithoutWinner.board_dogs[0], // 'ボス犬' (id=4)
        { move: { x: 1, y: 1 } }, // 移動データ
        expect.any(Function),
        expect.any(Function)
      );
    });

    // remove_from_board_request が呼ばれていないことを確認
    expect(mockRemoveFromBoardRequest).not.toHaveBeenCalled();
  });

  /**
   * テストケース2: 同じ犬をクリックして選択を解除する場合
   */
  test('handles click counts correctly in Board - deselect action', async () => {
    render(
      <GameBoard
        initialData={mockInitialDataWithoutWinner}
        operationRequest={mockOperationRequest}
        rulesFunction={rules}
      />
    );

    const bossDog = screen.getByTestId('dog-4'); // 'ボス犬'

    // 1度目のクリック: 'ボス犬' を選択
    fireEvent.click(bossDog);
    expect(rules.check_movement_type).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ボス犬' }),
      { move: { x: 1, y: 1 } }
    );
    expect(rules.check_duplicate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ボス犬' }),
      { move: { x: 1, y: 1 } }
    );
    expect(rules.check_over_max_board).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ボス犬' }),
      { move: { x: 1, y: 1 } }
    );
    expect(rules.check_no_adjacent).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ボス犬' }),
      { move: { x: 1, y: 1 } }
    );
    expect(rules.check_boss_cant_remove).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ボス犬' }),
      { move: { x: 1, y: 1 } }
    );

    // 2度目のクリック: 同じ犬 'ボス犬' をクリックして選択を解除
    fireEvent.click(bossDog);
    await waitFor(() => {
      // operationRequest.move_request と remove_from_board_request が呼ばれていないことを確認
      expect(mockMoveRequest).not.toHaveBeenCalled();
      expect(mockRemoveFromBoardRequest).not.toHaveBeenCalled();
    });
  });

  /**
   * テストケース3: 手札の枠をクリックして削除する場合
   */
  test('handles click counts correctly in Board - remove action', async () => {
    render(
      <GameBoard
        initialData={mockInitialDataWithoutWinner}
        operationRequest={mockOperationRequest}
        rulesFunction={rules}
      />
    );

    const bossDog = screen.getByTestId('dog-4'); // 'ボス犬'
    const handAreaPlayer1 = screen.getByTestId('remove-area-player-1'); // 'hand-area-player-1' の remove area

    // 1度目のクリック: 'ボス犬' を選択
    fireEvent.click(bossDog);
    expect(rules.check_movement_type).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ボス犬' }),
      { move: { x: 1, y: 1 } }
    );
    expect(rules.check_duplicate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ボス犬' }),
      { move: { x: 1, y: 1 } }
    );
    expect(rules.check_over_max_board).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ボス犬' }),
      { move: { x: 1, y: 1 } }
    );
    expect(rules.check_no_adjacent).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ボス犬' }),
      { move: { x: 1, y: 1 } }
    );
    expect(rules.check_boss_cant_remove).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ボス犬' }),
      { move: { x: 1, y: 1 } }
    );

    // 2度目のクリック: 手札の枠 'remove-area-player-1' をクリックして削除
    fireEvent.click(handAreaPlayer1);
    await waitFor(() => {
      expect(mockRemoveFromBoardRequest).toHaveBeenCalledWith(
        mockInitialDataWithoutWinner.board_dogs[0], // 'ボス犬' (id=4)
        expect.any(Function),
        expect.any(Function)
      );
    });

    // move_request が呼ばれていないことを確認
    expect(mockMoveRequest).not.toHaveBeenCalled();
  });
});