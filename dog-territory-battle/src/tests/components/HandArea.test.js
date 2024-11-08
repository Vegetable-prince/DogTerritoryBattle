// src/components/HandArea.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import HandArea from '../../components/HandArea';
import '@testing-library/jest-dom';

describe('HandArea Component', () => {
    const mockOnDogClick = jest.fn();

    test('renders dogs correctly', () => {
        const dogs = [
            { id: 1, name: 'ボス犬', is_in_hand: true, player: 1 },
            { id: 2, name: 'アニキ犬', is_in_hand: true, player: 1 },
        ];

        const { getByText } = render(
            <HandArea dogs={dogs} highlighted={null} onDogClick={mockOnDogClick} />
        );

        expect(getByText('ボス犬')).toBeInTheDocument();
        expect(getByText('アニキ犬')).toBeInTheDocument();
    });

    test('handles dog click', () => {
        const dogs = [
            { id: 1, name: 'ボス犬', is_in_hand: true, player: 1 },
        ];

        const { getByText } = render(
            <HandArea dogs={dogs} highlighted={null} onDogClick={mockOnDogClick} />
        );

        fireEvent.click(getByText('ボス犬'));
        expect(mockOnDogClick).toHaveBeenCalledWith(dogs[0]);
    });

    test('applies highlighted class', () => {
        const dogs = [
            { id: 1, name: 'ボス犬', is_in_hand: true, player: 1 },
        ];

        const { getByTestId } = render(
            <HandArea dogs={dogs} highlighted={{ id: 1 }} onDogClick={mockOnDogClick} />
        );

        const handArea = getByTestId('player1-hand');
        expect(handArea).toHaveClass('highlighted');
    });
});