// src/tests/components/Board.test.js
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import Board from '../../components/GameJs/Board';
import '@testing-library/jest-dom';
import * as rules from '../../utils/rules';

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

describe('Board Component', () => {
  const mockMoveRequest = jest.fn();
  const mockRemoveFromBoardRequest = jest.fn();

  const mockOperationRequest = {
    move_request: mockMoveRequest,
    remove_from_board_request: mockRemoveFromBoardRequest,
  };

  const mockInitialData = {
    board_dogs: [
      {
        id: 1,
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
        id: 2,
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

  test('calls rules functions on first click and move_request on second click when clicking a different dog', async () => {
    render(
      <Board
        dogs={mockInitialData.board_dogs}
        setBoardDogs={jest.fn()}
        switchTurn={jest.fn()}
        currentTurn={1}
        rulesFunction={rules}
        operationRequest={mockOperationRequest}
      />
    );

    const bossDog = screen.getByTestId('dog-1'); // data-testid="dog-1"
    const anikiDog = screen.getByTestId('dog-2'); // data-testid="dog-2"

    // 1度目のクリック: ルール関数が呼ばれることを確認
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

    // 2度目のクリック: 異なる犬をクリックして移動
    fireEvent.click(anikiDog);
    await waitFor(() => {
      expect(mockMoveRequest).toHaveBeenCalledWith(
        mockInitialData.board_dogs[0], // 'ボス犬'
        { move: { x: 1, y: 1 } }, // 適切な移動データを設定
        expect.any(Function),
        expect.any(Function)
      );
    });

    // remove_from_board_request が呼ばれていないことを確認
    expect(mockRemoveFromBoardRequest).not.toHaveBeenCalled();
  });

  test('calls rules functions on first click and remove_from_board_request on second click when clicking the same dog', async () => {
    render(
      <Board
        dogs={mockInitialData.board_dogs}
        setBoardDogs={jest.fn()}
        switchTurn={jest.fn()}
        currentTurn={1}
        rulesFunction={rules}
        operationRequest={mockOperationRequest}
      />
    );

    const bossDog = screen.getByTestId('dog-1'); // data-testid="dog-1"

    // 1度目のクリック: ルール関数が呼ばれることを確認
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

    // 2度目のクリック: 同じ犬をクリックして削除
    fireEvent.click(bossDog);
    await waitFor(() => {
      expect(mockRemoveFromBoardRequest).toHaveBeenCalledWith(
        mockInitialData.board_dogs[0], // 'ボス犬'
        expect.any(Function),
        expect.any(Function)
      );
    });

    // move_request が呼ばれていないことを確認
    expect(mockMoveRequest).not.toHaveBeenCalled();
  });

  test('applies correct style to dogs based on their position', () => {
    render(
      <Board
        dogs={mockInitialData.board_dogs}
        setBoardDogs={jest.fn()}
        switchTurn={jest.fn()}
        currentTurn={1}
        rulesFunction={rules}
        operationRequest={mockOperationRequest}
      />
    );

    const bossDog = screen.getByTestId('dog-1'); // data-testid="dog-1"
    const anikiDog = screen.getByTestId('dog-2'); // data-testid="dog-2"

    // ボス犬のスタイルを確認
    expect(bossDog).toHaveStyle(`left: ${mockInitialData.board_dogs[0].left}px`);
    expect(bossDog).toHaveStyle(`top: ${mockInitialData.board_dogs[0].top}px`);

    // アニキ犬のスタイルを確認
    expect(anikiDog).toHaveStyle(`left: ${mockInitialData.board_dogs[1].left}px`);
    expect(anikiDog).toHaveStyle(`top: ${mockInitialData.board_dogs[1].top}px`);
  });

  test('calls operation_request on second click after highlighting', async () => {
    render(
      <Board
        dogs={mockInitialData.board_dogs}
        setBoardDogs={jest.fn()}
        switchTurn={jest.fn()}
        currentTurn={1}
        rulesFunction={rules}
        operationRequest={mockOperationRequest}
      />
    );

    const anikiDog = screen.getByTestId('dog-2'); // data-testid="dog-2"

    // 1度目のクリック: ルール関数が呼ばれることを確認
    fireEvent.click(anikiDog);
    expect(rules.check_duplicate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'アニキ犬' }),
      { move: { x: 1, y: 1 } }
    );

    // 2度目のクリック: 異なる犬をクリックして移動
    fireEvent.click(anikiDog); // 同じ犬をクリックして削除
    await waitFor(() => {
      expect(mockRemoveFromBoardRequest).toHaveBeenCalledWith(
        mockInitialData.board_dogs[1], // 'アニキ犬'
        expect.any(Function),
        expect.any(Function)
      );
    });

    // move_request が呼ばれていないことを確認
    expect(mockMoveRequest).not.toHaveBeenCalled();
  });
});