// src/components/ValidMove.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ValidMove from '../../components/ValidMove';
import '@testing-library/jest-dom';

describe('ValidMove Component', () => {
    const mockOnClick = jest.fn();

    const move = { x: 1, y: 1 };

    test('renders valid move correctly', () => {
        const { getByRole } = render(<ValidMove move={move} onClick={mockOnClick} />);
        const moveElement = getByRole('button', { name: /valid-move/i });
        expect(moveElement).toBeInTheDocument();
        expect(moveElement).toHaveStyle(`left: ${move.x * 100}px`);
        expect(moveElement).toHaveStyle(`top: ${move.y * 100}px`);
    });

    test('handles click event', () => {
        const { getByRole } = render(<ValidMove move={move} onClick={mockOnClick} />);
        const moveElement = getByRole('button', { name: /valid-move/i });
        fireEvent.click(moveElement);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
});