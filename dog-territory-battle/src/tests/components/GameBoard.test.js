import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import GameBoard from '../../components/GameBoard';
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
}));

import * as rules from '../../utils/rules';
import * as operationRequests from '../../api/operation_requests';

describe('GameBoard Component', () => {
  const mockMoveRequest = operationRequests.move_request;
  const mockRemoveFromBoardRequest = operationRequests.remove_from_board_request;
  const mockPlaceOnBoardRequest = operationRequests.place_on_board_request;

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * 子コンポーネントのレンダリング確認
   */
  test('renders all child components correctly', () => {
    const { getByTestId, getByText } = render(<GameBoard />);

    // HandArea コンポーネントがレンダリングされていることを確認
    const handArea = getByTestId('hand-area');
    expect(handArea).toBeInTheDocument();

    // Board コンポーネントがレンダリングされていることを確認
    const board = getByTestId('game-board');
    expect(board).toBeInTheDocument();

    // WinnerModal コンポーネントがレンダリングされていることを確認
    const winnerModal = getByTestId('winner-modal');
    expect(winnerModal).toBeInTheDocument();

    // ShowCurrentTurn コンポーネントがレンダリングされていることを確認
    const currentTurn = getByTestId('current-turn');
    expect(currentTurn).toBeInTheDocument();

    // ExtraOperation コンポーネントがレンダリングされていることを確認
    const extraOperation = getByTestId('extra-operation');
    expect(extraOperation).toBeInTheDocument();
  });

  /**
   * HandArea 内の Dog コンポーネントのレンダリング確認
   */
  test('renders Dog components within HandArea', () => {
    const { getByTestId, getByText } = render(<GameBoard />);

    const handArea = getByTestId('hand-area');

    // 仮定: HandArea に 'アニキ犬' と 'ヤイバト' が手札に存在
    expect(getByText('アニキ犬')).toBeInTheDocument();
    expect(getByText('ヤイバト')).toBeInTheDocument();

    // Dog コンポーネントが HandArea の子として存在することを確認
    expect(handArea).toContainElement(getByText('アニキ犬'));
    expect(handArea).toContainElement(getByText('ヤイバト'));
  });

  /**
   * Board 内の Dog コンポーネントのレンダリング確認
   */
  test('renders Dog components within Board', () => {
    const { getByTestId, getByText } = render(<GameBoard />);

    const board = getByTestId('game-board');

    // 仮定: Board に 'ボス犬' と 'アニキ犬' が存在
    expect(getByText('ボス犬')).toBeInTheDocument();
    expect(getByText('アニキ犬')).toBeInTheDocument();

    // Dog コンポーネントが Board の子として存在することを確認
    expect(board).toContainElement(getByText('ボス犬'));
    expect(board).toContainElement(getByText('アニキ犬'));
  });

  /**
   * フックの動作確認: HandArea でのクリックカウント
   */
  test('handles click counts correctly in HandArea', async () => {
    const { getByText } = render(<GameBoard />);

    const anikiDog = getByText('アニキ犬');

    // 1度目のクリック: ルール関数が呼ばれることを確認
    fireEvent.click(anikiDog);
    expect(rules.check_duplicate).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }));
    expect(rules.check_over_max_board).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }));
    expect(rules.check_own_adjacent).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }));
    expect(rules.check_would_lose).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }));

    // 2度目のクリック: place_on_board_request が呼ばれることを確認
    fireEvent.click(anikiDog);
    await waitFor(() => {
      expect(operationRequests.place_on_board_request).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }), expect.any(Object));
    });
  });

  /**
   * フックの動作確認: Board でのクリックカウント
   */
  test('handles click counts correctly in Board', async () => {
    const { getByText } = render(<GameBoard />);

    const bossDog = getByText('ボス犬');

    // 1度目のクリック: ルール関数が呼ばれることを確認
    fireEvent.click(bossDog);
    expect(rules.check_movement_type).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }), expect.any(Object));
    expect(rules.check_duplicate).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_over_max_board).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_no_adjacent).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_would_lose).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_boss_cant_remove).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));

    // 2度目のクリック: move_request が呼ばれることを確認
    fireEvent.click(bossDog);
    await waitFor(() => {
      expect(operationRequests.move_request).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }), expect.any(Object));
    });
  });

  /**
   * WinnerModal の表示確認
   */
  test('displays WinnerModal when a winner is determined', () => {
    const { getByTestId } = render(<GameBoard />);

    // 仮定: ゲームが終了している状態で WinnerModal が表示されている
    // 具体的なゲーム終了の条件に応じて、テストを調整してください

    const winnerModal = getByTestId('winner-modal');
    expect(winnerModal).toBeInTheDocument();

    // 勝者の表示を確認（例: "Player 1 Wins!"）
    expect(winnerModal).toHaveTextContent('Player 1 Wins!');
  });

  /**
   * ShowCurrentTurn の表示確認
   */
  test('displays current turn correctly', () => {
    const { getByTestId } = render(<GameBoard />);

    const currentTurn = getByTestId('current-turn');
    expect(currentTurn).toBeInTheDocument();

    // 現在のターンが Player 1 であることを確認
    expect(currentTurn).toHaveTextContent('現在のターン: Player 1');
  });

  /**
   * ExtraOperation の動作確認
   */
  test('handles ExtraOperation buttons correctly', () => {
    const { getByText } = render(<GameBoard />);

    const resetButton = getByText('リセット');
    const undoButton = getByText('巻き戻し');

    // リセットボタンをクリック: operation_requests が呼ばれることを確認
    fireEvent.click(resetButton);
    expect(operationRequests.reset_game_request).toHaveBeenCalled();

    // 巻き戻しボタンをクリック: operation_requests が呼ばれることを確認
    fireEvent.click(undoButton);
    expect(operationRequests.undo_move_request).toHaveBeenCalled();
  });

  /**
   * Dog コンポーネントのクリックが HandArea と Board に正しく伝達されるか確認
   */
  test('Dog component clicks are handled correctly in HandArea and Board', async () => {
    const { getByText } = render(<GameBoard />);

    const anikiDog = getByText('アニキ犬');
    const bossDog = getByText('ボス犬');

    // HandArea 内のアニキ犬をクリック
    fireEvent.click(anikiDog);
    expect(rules.check_duplicate).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }));
    expect(rules.check_over_max_board).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }));
    expect(rules.check_own_adjacent).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }));
    expect(rules.check_would_lose).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }));

    fireEvent.click(anikiDog);
    await waitFor(() => {
      expect(operationRequests.place_on_board_request).toHaveBeenCalledWith(expect.objectContaining({ name: 'アニキ犬' }), expect.any(Object));
    });

    // Board 内のボス犬をクリック
    fireEvent.click(bossDog);
    expect(rules.check_movement_type).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }), expect.any(Object));
    expect(rules.check_duplicate).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_over_max_board).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_no_adjacent).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_would_lose).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));
    expect(rules.check_boss_cant_remove).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }));

    fireEvent.click(bossDog);
    await waitFor(() => {
      expect(operationRequests.move_request).toHaveBeenCalledWith(expect.objectContaining({ name: 'ボス犬' }), expect.any(Object));
    });
  });
});