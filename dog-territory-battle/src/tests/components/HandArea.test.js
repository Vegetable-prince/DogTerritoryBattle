// 修正後の HandArea.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import HandArea from '../../components/GameJs/HandArea';
import '@testing-library/jest-dom';

describe('HandArea Component', () => {
    const mockOnDogClick = jest.fn();
    const mockCheckDuplicate = jest.fn();
    const mockCheckOverMaxBoard = jest.fn();
    const mockCheckOwnAdjacent = jest.fn();
    const mockCheckWouldLose = jest.fn();
    const mockPlaceOnBoardRequest = jest.fn();
    const mockRulesFunction = {
        check_duplicate: mockCheckDuplicate,
        check_over_max_board: mockCheckOverMaxBoard,
        check_own_adjacent: mockCheckOwnAdjacent,
        check_would_lose: mockCheckWouldLose,
    };
    const mockOperationRequest = {
        place_on_board_request: mockPlaceOnBoardRequest,
    };
    const mockSetHandDogs = jest.fn();
    const mockSetBoardDogs = jest.fn();
    const mockSwitchTurn = jest.fn();

    // モックデータの作成
    const dogs = [
        {
            id: 1,
            name: 'アニキ犬',
            is_in_hand: true,
            player: 1,
            dog_type: {
                id: 2,
                name: 'アニキ犬',
                movement_type: '走行',
                max_steps: 5,
            },
        },
    ];

    const mockBoardDogs = [
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
    ];

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * 正常系:
     * HandAreaが正しく犬をレンダリングし、1度目のクリックでrules関数が呼ばれ、2度目のクリックでoperation_requestが呼ばれるかを確認
     */
    test('calls rules functions on first click and operation_request on second click', () => {
        const { getByTestId } = render(
            <HandArea
                dogs={dogs}
                setHandDogs={mockSetHandDogs}
                setBoardDogs={mockSetBoardDogs}
                switchTurn={mockSwitchTurn}
                currentTurn={1}
                player={1}
                boardDogs={mockBoardDogs}
                rulesFunction={mockRulesFunction}
                operationRequest={mockOperationRequest}
            />
        );

        const aniDog = getByTestId('dog-1'); // data-testid="dog-1"

        // 1度目のクリック: rules関数が呼ばれることを確認
        fireEvent.click(aniDog);
        expect(mockCheckDuplicate).toHaveBeenCalledWith(dogs[0]);
        expect(mockCheckOverMaxBoard).toHaveBeenCalledWith(dogs[0]);
        expect(mockCheckOwnAdjacent).toHaveBeenCalledWith(dogs[0]);
        expect(mockCheckWouldLose).toHaveBeenCalledWith(dogs[0]);
        expect(mockPlaceOnBoardRequest).not.toHaveBeenCalled();

        // 2度目のクリック: operation_request が呼ばれることを確認
        fireEvent.click(aniDog);
        expect(mockPlaceOnBoardRequest).toHaveBeenCalledWith(dogs[0], { move: { x: 1, y: 1 } });
    });

    /**
     * 異常系:
     * HandAreaに無効な犬オブジェクトが渡された場合の挙動を確認
     */
    test('does not crash with invalid dogs prop', () => {
        const invalidDogs = null; // 無効な犬オブジェクト

        const { container } = render(
            <HandArea
                dogs={invalidDogs}
                setHandDogs={mockSetHandDogs}
                setBoardDogs={mockSetBoardDogs}
                switchTurn={mockSwitchTurn}
                currentTurn={1}
                player={1}
                boardDogs={mockBoardDogs}
                rulesFunction={mockRulesFunction}
                operationRequest={mockOperationRequest}
            />
        );

        // コンポーネントが何もレンダリングしないことを確認
        expect(container).toBeEmptyDOMElement();
    });

    /**
     * エッジケース:
     * HandAreaに犬が一匹も存在しない場合の表示を確認
     */
    test('renders empty HandArea when no dogs are present', () => {
        const emptyDogs = [];

        const { getByTestId } = render(
            <HandArea
                dogs={emptyDogs}
                setHandDogs={mockSetHandDogs}
                setBoardDogs={mockSetBoardDogs}
                switchTurn={mockSwitchTurn}
                currentTurn={1}
                player={1}
                boardDogs={mockBoardDogs}
                rulesFunction={mockRulesFunction}
                operationRequest={mockOperationRequest}
            />
        );

        const handArea = screen.getByTestId('hand-area-player-1');
        expect(handArea).toBeInTheDocument();
        expect(handArea).toBeEmptyDOMElement();
    });

    /**
     * エッジケース:
     * HandAreaのハイライトが正しく適用されているかを確認
     */
    test('applies highlighted class when highlighted prop is set', () => {
        const highlighted = { id: 1 };

        const { getByTestId } = render(
            <HandArea
                dogs={dogs}
                setHandDogs={mockSetHandDogs}
                setBoardDogs={mockSetBoardDogs}
                switchTurn={mockSwitchTurn}
                currentTurn={1}
                player={1}
                boardDogs={mockBoardDogs}
                highlighted={highlighted}
                rulesFunction={mockRulesFunction}
                operationRequest={mockOperationRequest}
            />
        );

        const handArea = screen.getByTestId('hand-area-player-1');
        expect(handArea).toHaveClass('highlighted');
    });

    /**
     * 異常系:
     * onDogClickが未定義の場合、クリックしてもエラーが発生しないことを確認
     */
    test('handles click without onDogClick prop gracefully', () => {
        const { getByTestId } = render(
            <HandArea
                dogs={dogs}
                setHandDogs={mockSetHandDogs}
                setBoardDogs={mockSetBoardDogs}
                switchTurn={mockSwitchTurn}
                currentTurn={1}
                player={1}
                boardDogs={mockBoardDogs}
                highlighted={null}
                onDogClick={null}
                rulesFunction={mockRulesFunction}
                operationRequest={mockOperationRequest}
            />
        );

        // 犬をクリックしてもエラーが発生しないことを確認
        const aniDog = screen.getByTestId('dog-1');
        expect(() => fireEvent.click(aniDog)).not.toThrow();
    });
});