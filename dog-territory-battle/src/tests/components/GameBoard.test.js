// src/tests/components/GameBoard.test.js
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import GameBoard from '../../components/GameJs/GameBoard';
import '@testing-library/jest-dom';

// モックの設定
jest.mock('../../utils/rules', () => ({
  check_movement_type: jest.fn(),
  check_duplicate: jest.fn(),
  check_over_max_board: jest.fn(),
  check_no_adjacent: jest.fn(),
  check_own_adjacent: jest.fn(),
  check_would_lose: jest.fn(),
  check_boss_cant_remove: jest.fn(),
}));

jest.mock('../../api/operation_requests', () => ({
  move_request: jest.fn(),
  remove_from_board_request: jest.fn(),
  place_on_board_request: jest.fn(),
  reset_game_request: jest.fn(),
  undo_move_request: jest.fn(),
}));

import * as rules from '../../utils/rules';
import * as operationRequests from '../../api/operation_requests';

describe('GameBoard Component', () => {
  const mockMoveRequest = operationRequests.move_request;
  const mockRemoveFromBoardRequest = operationRequests.remove_from_board_request;
  const mockPlaceOnBoardRequest = operationRequests.place_on_board_request;
  const mockResetGameRequest = operationRequests.reset_game_request;
  const mockUndoMoveRequest = operationRequests.undo_move_request;

  beforeEach(() => {
    // ルール関数のデフォルトの動作を設定
    rules.check_duplicate.mockReturnValue(false);
    rules.check_over_max_board.mockReturnValue(false);
    rules.check_own_adjacent.mockReturnValue(true);
    rules.check_would_lose.mockReturnValue(false);
    rules.check_movement_type.mockReturnValue(true);
    rules.check_no_adjacent.mockReturnValue(true);
    rules.check_boss_cant_remove.mockReturnValue(true);

    // operation_requests のデフォルトの動作を設定
    mockMoveRequest.mockResolvedValue({ data: { success: true } });
    mockRemoveFromBoardRequest.mockResolvedValue({ data: { success: true } });
    mockPlaceOnBoardRequest.mockResolvedValue({ data: { success: true } });
    mockResetGameRequest.mockResolvedValue({ data: { success: true } });
    mockUndoMoveRequest.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * モックデータの作成
   */
  const mockInitialData = {
    game: {
      current_turn: 1,
      id: 1,
      player1: 1,
      player2: 2,
      winner: 1, // 勝者を設定
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
        player: 1,
      },
    ],
  };

  /**
   * 子コンポーネントのレンダリング確認
   */
  test('renders all child components correctly', () => {
    render(<GameBoard initialData={mockInitialData} />);

    // HandArea コンポーネントがレンダリングされていることを確認
    const handArea = screen.getByTestId('hand-area-player-1');
    expect(handArea).toBeInTheDocument();

    // Board コンポーネントがレンダリングされていることを確認
    const board = screen.getByTestId('game-board');
    expect(board).toBeInTheDocument();

    // WinnerModal コンポーネントがレンダリングされていることを確認
    const winnerModal = screen.getByTestId('winner-modal');
    expect(winnerModal).toBeInTheDocument();

    // ShowCurrentTurn コンポーネントがレンダリングされていることを確認
    const currentTurn = screen.getByTestId('current-turn');
    expect(currentTurn).toBeInTheDocument();

    // ExtraOperation コンポーネントがレンダリングされていることを確認
    const extraOperation = screen.getByTestId('extra-operation');
    expect(extraOperation).toBeInTheDocument();
  });

  /**
   * HandArea 内の Dog コンポーネントのレンダリング確認
   */
  test('renders Dog components within HandArea', () => {
    render(<GameBoard initialData={mockInitialData} />);

    const handArea = screen.getByTestId('hand-area-player-1');

    // HandArea に 'アニキ犬' と 'ヤイバト' が手札に存在
    expect(screen.getByText('アニキ犬')).toBeInTheDocument();
    expect(screen.getByText('ヤイバト')).toBeInTheDocument();

    // Dog コンポーネントが HandArea の子として存在することを確認
    expect(handArea).toContainElement(screen.getByText('アニキ犬'));
    expect(handArea).toContainElement(screen.getByText('ヤイバト'));
  });

  /**
   * Board 内の Dog コンポーネントのレンダリング確認
   */
  test('renders Dog components within Board', () => {
    render(<GameBoard initialData={mockInitialData} />);

    const board = screen.getByTestId('game-board');

    // Board に 'ボス犬' と 'アニキ犬' が存在
    const bossDogs = screen.getAllByText('ボス犬');
    const anikiDogs = screen.getAllByText('アニキ犬');

    expect(bossDogs.length).toBeGreaterThanOrEqual(1);
    expect(anikiDogs.length).toBeGreaterThanOrEqual(1);

    // Dog コンポーネントが Board の子として存在することを確認
    expect(board).toContainElement(bossDogs[0]);
    expect(board).toContainElement(anikiDogs[0]);
  });

  /**
   * フックの動作確認: HandArea でのクリックカウント
   */
  test('handles click counts correctly in HandArea', async () => {
    render(<GameBoard initialData={mockInitialData} />);

    const anikiDog = screen.getByTestId('dog-2'); // data-testid="dog-2"

    // 1度目のクリック: ルール関数が呼ばれることを確認
    fireEvent.click(anikiDog);
    expect(rules.check_duplicate).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }));
    expect(rules.check_over_max_board).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }));
    expect(rules.check_own_adjacent).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }));
    expect(rules.check_would_lose).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }));

    // 2度目のクリック: place_on_board_request が呼ばれることを確認
    fireEvent.click(anikiDog);
    await waitFor(() => {
      expect(operationRequests.place_on_board_request).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'アニキ犬' }),
        expect.any(Object)
      );
    });
  });

  /**
   * フックの動作確認: Board でのクリックカウント
   */
  test('handles click counts correctly in Board', async () => {
    render(<GameBoard initialData={mockInitialData} />);

    const bossDog = screen.getByTestId('dog-1'); // data-testid="dog-1"

    // 1度目のクリック: ルール関数が呼ばれることを確認
    fireEvent.click(bossDog);
    expect(rules.check_movement_type).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_duplicate).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_over_max_board).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_no_adjacent).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_would_lose).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_boss_cant_remove).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));

    // 2度目のクリック: move_request が呼ばれることを確認
    fireEvent.click(bossDog);
    await waitFor(() => {
      expect(operationRequests.move_request).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'ボス犬' }),
        expect.any(Object)
      );
    });
  });

  /**
   * WinnerModal の表示確認
   */
  test('displays WinnerModal when a winner is determined', () => {
    render(<GameBoard initialData={mockInitialData} />);

    const winnerModal = screen.getByTestId('winner-modal');
    expect(winnerModal).toBeInTheDocument();

    // 勝者の表示を確認（例: "Player 1 Wins!"）
    expect(winnerModal).toHaveTextContent('Player 1 Wins!');
  });

  /**
   * ShowCurrentTurn の表示確認
   */
  test('displays current turn correctly', () => {
    render(<GameBoard initialData={mockInitialData} />);

    const currentTurn = screen.getByTestId('current-turn');
    expect(currentTurn).toBeInTheDocument();

    // 現在のターンが Player 1 であることを確認
    expect(currentTurn).toHaveTextContent('現在のターン: Player 1');
  });

  /**
   * ExtraOperation の動作確認
   */
  test('handles ExtraOperation buttons correctly', () => {
    render(<GameBoard initialData={mockInitialData} />);

    const resetButton = screen.getByTestId('reset-button'); // data-testid="reset-button" を追加
    const undoButton = screen.getByTestId('undo-button');   // data-testid="undo-button" を追加

    // リセットボタンをクリック: reset_game_request が呼ばれることを確認
    fireEvent.click(resetButton);
    expect(operationRequests.reset_game_request).toHaveBeenCalled();

    // 巻き戻しボタンをクリック: undo_move_request が呼ばれることを確認
    fireEvent.click(undoButton);
    expect(operationRequests.undo_move_request).toHaveBeenCalled();
  });

  /**
   * Dog コンポーネントのクリックが HandArea と Board に正しく伝達されるか確認
   */
  test('Dog component clicks are handled correctly in HandArea and Board', async () => {
    render(<GameBoard initialData={mockInitialData} />);

    const anikiDog = screen.getByTestId('dog-2'); // data-testid="dog-2"
    const bossDog = screen.getByTestId('dog-1'); // data-testid="dog-1"

    // HandArea 内のアニキ犬をクリック
    fireEvent.click(anikiDog);
    expect(rules.check_duplicate).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }));
    expect(rules.check_over_max_board).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }));
    expect(rules.check_own_adjacent).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }));
    expect(rules.check_would_lose).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }));

    fireEvent.click(anikiDog);
    await waitFor(() => {
      expect(operationRequests.place_on_board_request).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'アニキ犬' }),
        expect.any(Object)
      );
    });

    // Board 内のボス犬をクリック
    fireEvent.click(bossDog);
    expect(rules.check_movement_type).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_duplicate).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_over_max_board).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_no_adjacent).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_would_lose).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_boss_cant_remove).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));

    fireEvent.click(bossDog);
    await waitFor(() => {
      expect(operationRequests.move_request).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'ボス犬' }),
        expect.any(Object)
      );
    });
  });
});