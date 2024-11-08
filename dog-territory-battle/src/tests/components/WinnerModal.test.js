// src/components/WinnerModal.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import WinnerModal from '../../components/WinnerModal';
import '@testing-library/jest-dom';

describe('WinnerModal Component', () => {
    const mockOnClose = jest.fn();

    test('renders winner message correctly', () => {
        const winner = 'Player 1';
        const { getByText } = render(<WinnerModal winner={winner} onClose={mockOnClose} />);
        expect(getByText(`おめでとうございます、${winner}さんが勝ちました！`)).toBeInTheDocument();
    });

    test('handles close button click', () => {
        const winner = 'Player 1';
        const { getByText } = render(<WinnerModal winner={winner} onClose={mockOnClose} />);
        fireEvent.click(getByText('閉じる'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});