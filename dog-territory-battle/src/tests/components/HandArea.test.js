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

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * 正常系:
     * HandAreaが正しく犬をレンダリングし、1度目のクリックでrules関数が呼ばれ、2度目のクリックでoperation_requestが呼ばれるかを確認
     */
    test('calls rules functions on first click and operation_request on second click', () => {
        const dogs = [
            { id: 1, name: 'アニキ犬', is_in_hand: true, player: 1 },
        ];

        const { getByText } = render(
            <HandArea
                dogs={dogs}
                highlighted={null}
                onDogClick={mockOnDogClick}
                nextAction="rules" // フックデータを 'rules' に設定
                rulesFunction={mockRulesFunction}
                operationRequest={mockOperationRequest}
            />
        );

        // 1度目のクリック: rules関数が呼ばれることを確認
        fireEvent.click(getByText('アニキ犬'));
        expect(mockCheckDuplicate).toHaveBeenCalledWith(dogs[0]);
        expect(mockCheckOverMaxBoard).toHaveBeenCalledWith(dogs[0]);
        expect(mockCheckOwnAdjacent).toHaveBeenCalledWith(dogs[0]);
        expect(mockCheckWouldLose).toHaveBeenCalledWith(dogs[0]);
        expect(mockPlaceOnBoardRequest).not.toHaveBeenCalled();

        // モックされたハイライトデータ（仮定）
        const highlightedMoves = [{ x: 1, y: 1 }, { x: 2, y: 2 }];
        // ハイライトされたマスを更新（実際の実装に依存）
        // ここでは、手動でハイライトを模擬するためのコードが必要になる場合があります。

        // 2度目のクリック: operation_request が呼ばれることを確認
        // 仮にハイライトされたマスの1つをクリック
        fireEvent.click(getByText('アニキ犬')); // 実際にはハイライトされたマスをクリックする必要があります
        // ここでは、仮に再度同じ犬をクリックして operation_request を呼び出すシナリオとしています
        // 実際にはハイライトされたマスの要素をクリックするように調整してください
        expect(mockPlaceOnBoardRequest).toHaveBeenCalledWith(dogs[0]);
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
                highlighted={null}
                onDogClick={mockOnDogClick}
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
                highlighted={null}
                onDogClick={mockOnDogClick}
                rulesFunction={mockRulesFunction}
                operationRequest={mockOperationRequest}
            />
        );

        const handArea = getByTestId('player1-hand');
        expect(handArea).toBeInTheDocument();
        expect(handArea).toBeEmptyDOMElement();
    });

    /**
     * エッジケース:
     * HandAreaのハイライトが正しく適用されているかを確認
     */
    test('applies highlighted class when highlighted prop is set', () => {
        const dogs = [
            { id: 1, name: 'アニキ犬', is_in_hand: true, player: 1 },
        ];

        const { getByTestId } = render(
            <HandArea
                dogs={dogs}
                highlighted={{ id: 1 }}
                onDogClick={mockOnDogClick}
                rulesFunction={mockRulesFunction}
                operationRequest={mockOperationRequest}
            />
        );

        const handArea = getByTestId('player1-hand');
        expect(handArea).toHaveClass('highlighted');
    });

    /**
     * 異常系:
     * onDogClickが未定義の場合、クリックしてもエラーが発生しないことを確認
     */
    test('handles click without onDogClick prop gracefully', () => {
        const dogs = [
            { id: 1, name: 'アニキ犬', is_in_hand: true, player: 1 },
        ];

        const { getByText } = render(
            <HandArea
                dogs={dogs}
                highlighted={null}
                onDogClick={null}
                rulesFunction={mockRulesFunction}
                operationRequest={mockOperationRequest}
            />
        );

        // 犬をクリックしてもエラーが発生しないことを確認
        expect(() => fireEvent.click(getByText('アニキ犬'))).not.toThrow();
    });
});