// src/tests/components/Board.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Board from '../../components/GameJs/Board';
import '@testing-library/jest-dom';

describe('Board Component', () => {
    const mockOnDogClick = jest.fn();
    const mockCheckMovementType = jest.fn();
    const mockCheckDuplicate = jest.fn();
    const mockCheckOverMaxBoard = jest.fn();
    const mockCheckNoAdjacent = jest.fn();
    const mockCheckWouldLose = jest.fn();
    const mockCheckBossCantRemove = jest.fn();
    const mockMoveRequest = jest.fn();
    const mockRemoveFromBoardRequest = jest.fn();
    const mockRulesFunction = {
        check_movement_type: mockCheckMovementType,
        check_duplicate: mockCheckDuplicate,
        check_over_max_board: mockCheckOverMaxBoard,
        check_no_adjacent: mockCheckNoAdjacent,
        check_would_lose: mockCheckWouldLose,
        check_boss_cant_remove: mockCheckBossCantRemove,
    };
    const mockOperationRequest = {
        move_request: mockMoveRequest,
        remove_from_board_request: mockRemoveFromBoardRequest,
    };
    const mockSetBoardDogs = jest.fn();
    const mockSwitchTurn = jest.fn();

    // モックデータの作成
    const initialData = {
        dogs: [
            {
                id: 1,
                name: 'ボス犬',
                left: 100,
                top: 100,
                is_in_hand: false, // 必要なプロパティを追加
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
                is_in_hand: false, // 必要なプロパティを追加
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

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * 正常系:
     * Boardが正しく犬をレンダリングし、1度目のクリックでrules関数が呼ばれ、2度目のクリックでoperation_requestが呼ばれるかを確認
     */
    test('calls rules functions on first click and operation_request on second click', () => {
        const { getByTestId } = render(
            <Board
                dogs={initialData.dogs}
                setBoardDogs={mockSetBoardDogs}
                switchTurn={mockSwitchTurn}
                currentTurn={1}
                rulesFunction={mockRulesFunction}
                operationRequest={mockOperationRequest}
            />
        );

        // 1度目のクリック: rules関数が呼ばれることを確認
        const bossDog = getByTestId('dog-1');
        fireEvent.click(bossDog);
        expect(mockCheckMovementType).toHaveBeenCalledWith(initialData.dogs[0]);
        expect(mockCheckDuplicate).toHaveBeenCalledWith(initialData.dogs[0]);
        expect(mockCheckOverMaxBoard).toHaveBeenCalledWith(initialData.dogs[0]);
        expect(mockCheckNoAdjacent).toHaveBeenCalledWith(initialData.dogs[0]);
        expect(mockCheckWouldLose).toHaveBeenCalledWith(initialData.dogs[0]);
        expect(mockCheckBossCantRemove).toHaveBeenCalledWith(initialData.dogs[0]);
        expect(mockMoveRequest).not.toHaveBeenCalled();
        expect(mockRemoveFromBoardRequest).not.toHaveBeenCalled();

        // 2度目のクリック: move_request が呼ばれることを確認
        fireEvent.click(bossDog);
        expect(mockMoveRequest).toHaveBeenCalledWith(initialData.dogs[0], { move: { x: 1, y: 1 } });
        expect(mockRemoveFromBoardRequest).not.toHaveBeenCalled();
    });

    /**
     * 正常系:
     * 次のアクションが 'operation' の場合、operationRequest が呼ばれるかを確認
     */
    test('calls operationRequest when nextAction is operation', () => {
        const { getByTestId } = render(
            <Board
                dogs={initialData.dogs}
                setBoardDogs={mockSetBoardDogs}
                switchTurn={mockSwitchTurn}
                currentTurn={1}
                nextAction="operation" // フックデータを 'operation' に設定
                rulesFunction={mockRulesFunction}
                operationRequest={mockOperationRequest}
            />
        );

        // 犬をクリック
        const bossDog = getByTestId('dog-1');
        fireEvent.click(bossDog);

        // 次のアクションが 'operation' の場合、operationRequest が呼ばれる
        expect(mockMoveRequest).toHaveBeenCalledWith(initialData.dogs[0], { move: { x: 1, y: 1 } });
        expect(mockRemoveFromBoardRequest).toHaveBeenCalledWith(initialData.dogs[0]);
    });

    /**
     * エッジケース:
     * Boardに犬が一匹も存在しない場合の表示を確認
     */
    test('renders empty Board when no dogs are present', () => {
        const emptyDogs = [];

        const { getByTestId } = render(
            <Board
                dogs={emptyDogs}
                setBoardDogs={mockSetBoardDogs}
                switchTurn={mockSwitchTurn}
                currentTurn={1}
                rulesFunction={mockRulesFunction}
                operationRequest={mockOperationRequest}
            />
        );

        const board = getByTestId('game-board');
        expect(board).toBeInTheDocument();
        expect(board).toBeEmptyDOMElement();
    });

    /**
     * エッジケース:
     * Board上で犬が重複して表示されないことを確認
     */
    test('does not render duplicate dogs on the board', () => {
        const duplicateDogs = [
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
                player: 2,
            },
        ];

        const { getAllByText } = render(
            <Board
                dogs={duplicateDogs}
                setBoardDogs={mockSetBoardDogs}
                switchTurn={mockSwitchTurn}
                currentTurn={1}
                rulesFunction={mockRulesFunction}
                operationRequest={mockOperationRequest}
            />
        );

        // ボス犬が2匹表示されていることを確認（重複の許可）
        expect(getAllByText('ボス犬').length).toBe(2);
    });

    /**
     * 正常系:
     * Board上の犬が適切なスタイルで配置されているかを確認
     */
    test('applies correct style to dogs based on their position', () => {
        const { getByTestId } = render(
            <Board
                dogs={initialData.dogs}
                setBoardDogs={mockSetBoardDogs}
                switchTurn={mockSwitchTurn}
                currentTurn={1}
                rulesFunction={mockRulesFunction}
                operationRequest={mockOperationRequest}
            />
        );

        const bossDog = screen.getByTestId('dog-1');
        const anikiDog = screen.getByTestId('dog-2');

        // ボス犬のスタイルを確認
        expect(bossDog).toHaveStyle(`left: ${initialData.dogs[0].left}px`);
        expect(bossDog).toHaveStyle(`top: ${initialData.dogs[0].top}px`);

        // アニキ犬のスタイルを確認
        expect(anikiDog).toHaveStyle(`left: ${initialData.dogs[1].left}px`);
        expect(anikiDog).toHaveStyle(`top: ${initialData.dogs[1].top}px`);
    });

    /**
     * エッジケース:
     * Board上で1度目のクリック後にハイライトされたマスをクリックすると operation_request が呼ばれるかを確認
     */
    test('calls operation_request on second click after highlighting', () => {
        const { getByTestId } = render(
            <Board
                dogs={initialData.dogs}
                setBoardDogs={mockSetBoardDogs}
                switchTurn={mockSwitchTurn}
                currentTurn={1}
                rulesFunction={mockRulesFunction}
                operationRequest={mockOperationRequest}
            />
        );

        // 1度目のクリック: rules関数が呼ばれることを確認
        const anikiDog = screen.getByTestId('dog-2');
        fireEvent.click(anikiDog);
        expect(mockCheckMovementType).toHaveBeenCalledWith(initialData.dogs[1]);
        expect(mockCheckDuplicate).toHaveBeenCalledWith(initialData.dogs[1]);
        expect(mockCheckOverMaxBoard).toHaveBeenCalledWith(initialData.dogs[1]);
        expect(mockCheckNoAdjacent).toHaveBeenCalledWith(initialData.dogs[1]);
        expect(mockCheckWouldLose).toHaveBeenCalledWith(initialData.dogs[1]);
        expect(mockCheckBossCantRemove).toHaveBeenCalledWith(initialData.dogs[1]);

        // 2度目のクリック: move_request が呼ばれることを確認
        fireEvent.click(anikiDog);
        expect(mockMoveRequest).toHaveBeenCalledWith(initialData.dogs[1], { move: { x: 1, y: 1 } });
        expect(mockRemoveFromBoardRequest).not.toHaveBeenCalled();
    });
});