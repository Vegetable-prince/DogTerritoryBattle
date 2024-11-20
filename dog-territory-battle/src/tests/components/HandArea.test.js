// src/tests/components/HandArea.test.js

import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import HandArea from '../../components/GameJs/HandArea'; // パスはプロジェクト構造に合わせて調整
import '@testing-library/jest-dom/extend-expect';

// モック関数の定義
const mockCheckMovementType = jest.fn();
const mockCheckDuplicate = jest.fn();
const mockCheckOverMaxBoard = jest.fn();
const mockCheckNoAdjacent = jest.fn();
const mockCheckBossCantRemove = jest.fn();
const mockCheckOwnAdjacent = jest.fn();
const mockCheckWouldLose = jest.fn();

const mockRulesFunction = {
  check_movement_type: mockCheckMovementType,
  check_duplicate: mockCheckDuplicate,
  check_over_max_board: mockCheckOverMaxBoard,
  check_no_adjacent: mockCheckNoAdjacent,
  check_boss_cant_remove: mockCheckBossCantRemove,
  check_own_adjacent: mockCheckOwnAdjacent,
  check_would_lose: mockCheckWouldLose,
};

const mockMoveRequest = jest.fn();
const mockRemoveFromBoardRequest = jest.fn();
const mockPlaceOnBoardRequest = jest.fn();

const mockOperationRequest = {
  move_request: mockMoveRequest,
  remove_from_board_request: mockRemoveFromBoardRequest,
  place_on_board_request: mockPlaceOnBoardRequest,
};

const mockSetSelectedDog = jest.fn();
const mockHandleRemove = jest.fn();

const mockSetHandDogs = jest.fn();
const mockSetBoardDogs = jest.fn();

const dogs = [
  {
    dog_type: { id: 2, max_steps: 5, movement_type: '走行', name: 'アニキ犬' },
    id: 1,
    is_in_hand: true,
    name: 'アニキ犬',
    player: 1,
  },
  // 必要に応じて他の犬を追加
];

describe('HandArea Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls rules functions on first click and operation_request on second click', async () => {
    render(
      <HandArea
        dogs={dogs}
        setHandDogs={mockSetHandDogs}
        setBoardDogs={mockSetBoardDogs}
        rulesFunction={mockRulesFunction}
        operationRequest={mockOperationRequest}
        setSelectedDog={mockSetSelectedDog}
        handleRemove={mockHandleRemove}
        highlighted={false} // または true
      />
    );

    const aniDog = screen.getByTestId('dog-1'); // アニキ犬の要素

    // 1度目のクリック: ルール関数が呼ばれることを確認
    fireEvent.click(aniDog);
    expect(mockCheckMovementType).toHaveBeenCalledWith(dogs[0], expect.any(Object));
    expect(mockCheckDuplicate).toHaveBeenCalledWith(dogs[0]);
    expect(mockCheckOverMaxBoard).toHaveBeenCalledWith(dogs[0]);
    expect(mockCheckNoAdjacent).toHaveBeenCalledWith(dogs[0]);
    expect(mockCheckBossCantRemove).toHaveBeenCalledWith(dogs[0]);
    expect(mockCheckOwnAdjacent).toHaveBeenCalledWith(dogs[0]);
    expect(mockCheckWouldLose).toHaveBeenCalledWith(dogs[0]);

    // 2度目のクリック: operation_request が呼ばれることを確認
    fireEvent.click(aniDog);
    await waitFor(() => {
      expect(mockPlaceOnBoardRequest).toHaveBeenCalledWith(dogs[0], { move: { x: 1, y: 1 } });
    });

    // `move_request` や `remove_from_board_request` が呼ばれていないことを確認
    expect(mockMoveRequest).not.toHaveBeenCalled();
    expect(mockRemoveFromBoardRequest).not.toHaveBeenCalled();
  });

  test('applies highlighted class when highlighted prop is set', () => {
    render(
      <HandArea
        dogs={dogs}
        setHandDogs={mockSetHandDogs}
        setBoardDogs={mockSetBoardDogs}
        rulesFunction={mockRulesFunction}
        operationRequest={mockOperationRequest}
        setSelectedDog={mockSetSelectedDog}
        handleRemove={mockHandleRemove}
        highlighted={true}
      />
    );

    // `data-testid="hand-area-player-1"` を持つ要素を探す
    const handArea = screen.getByTestId('hand-area-player-1');
    expect(handArea).toHaveClass('highlighted');
  });

  test('handles click without onDogClick prop gracefully', () => {
    render(
      <HandArea
        dogs={dogs}
        setHandDogs={mockSetHandDogs}
        setBoardDogs={mockSetBoardDogs}
        rulesFunction={mockRulesFunction}
        operationRequest={mockOperationRequest}
        setSelectedDog={mockSetSelectedDog}
        handleRemove={mockHandleRemove}
        highlighted={false}
      />
    );

    const aniDog = screen.getByTestId('dog-1');
    expect(() => fireEvent.click(aniDog)).not.toThrow();
  });
});