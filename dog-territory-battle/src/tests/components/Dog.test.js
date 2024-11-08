// src/components/Dog.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Dog from '../../components/Dog';
import '@testing-library/jest-dom';

describe('Dog Component', () => {
    const mockOnClick = jest.fn();

    const dog = {
        id: 1,
        name: 'ボス犬',
        left: 100,
        top: 100,
        player: 1,
        currentTurn: 1,
    };

    test('renders dog correctly', () => {
        const { getByText } = render(<Dog dog={dog} onClick={mockOnClick} />);
        expect(getByText('ボス犬')).toBeInTheDocument();
    });

    test('handles click event', () => {
        const { getByText } = render(<Dog dog={dog} onClick={mockOnClick} />);
        fireEvent.click(getByText('ボス犬'));
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    test('applies current-turn class when appropriate', () => {
        const { container } = render(<Dog dog={dog} onClick={mockOnClick} />);
        const dogElement = container.querySelector('.dog');
        expect(dogElement).toHaveClass('current-turn');
    });
});