// src/components/Board.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Board from '../../components/Board';
import '@testing-library/jest-dom';

describe('Board Component', () => {
    const mockOnDogClick = jest.fn();
    const mockOnMoveClick = jest.fn();

    const dogs = [
        { id: 1, name: 'ボス犬', left: 100, top: 100, player: 1, currentTurn: 1 },
        { id: 2, name: 'アニキ犬', left: 200, top: 200, player: 2, currentTurn: 1 },
    ];

    const validMoves = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
    ];

    const boardBounds = { minX: 1, maxX: 2, minY: 1, maxY: 2 };
    const showBorders = { vertical: true, horizontal: true };

    test('renders dogs correctly', () => {
        const { getByText } = render(
            <Board
                dogs={dogs}
                validMoves={validMoves}
                boardBounds={boardBounds}
                onDogClick={mockOnDogClick}
                onMoveClick={mockOnMoveClick}
                showBorders={showBorders}
            />
        );

        expect(getByText('ボス犬')).toBeInTheDocument();
        expect(getByText('アニキ犬')).toBeInTheDocument();
    });

    test('handles dog click', () => {
        const { getByText } = render(
            <Board
                dogs={dogs}
                validMoves={validMoves}
                boardBounds={boardBounds}
                onDogClick={mockOnDogClick}
                onMoveClick={mockOnMoveClick}
                showBorders={showBorders}
            />
        );

        fireEvent.click(getByText('ボス犬'));
        expect(mockOnDogClick).toHaveBeenCalledWith(dogs[0]);
    });

    test('renders valid moves', () => {
        const { getAllByRole } = render(
            <Board
                dogs={dogs}
                validMoves={validMoves}
                boardBounds={boardBounds}
                onDogClick={mockOnDogClick}
                onMoveClick={mockOnMoveClick}
                showBorders={showBorders}
            />
        );

        const moveElements = getAllByRole('button', { name: /valid-move/i });
        expect(moveElements.length).toBe(2);
    });

    test('handles move click', () => {
        const { getAllByRole } = render(
            <Board
                dogs={dogs}
                validMoves={validMoves}
                boardBounds={boardBounds}
                onDogClick={mockOnDogClick}
                onMoveClick={mockOnMoveClick}
                showBorders={showBorders}
            />
        );

        const moveElements = getAllByRole('button', { name: /valid-move/i });
        fireEvent.click(moveElements[0]);
        expect(mockOnMoveClick).toHaveBeenCalledWith(validMoves[0]);
    });
});