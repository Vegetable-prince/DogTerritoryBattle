import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WinnerModal from '../../components/GameJs/WinnerModal';
import '@testing-library/jest-dom';

describe('WinnerModal Component', () => {
  const mockOnClose = jest.fn();

  const winner = 'player1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('player1が勝利した場合、敗北のモーダルが表示される', () => {
    const winner = 'player1';

    render(<WinnerModal isOpen={true} winner={winner} onClose={mockOnClose} />);

    // モーダルが表示されていることを確認
    const modalElement = screen.getByTestId('winner-modal');
    expect(modalElement).toBeInTheDocument();

    // img要素の取得と検証
    const image = screen.getByAltText('敗北モーダル画像');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/assets/images/winner_modals/lose_modal.svg');
  });

  test('player2が勝利した場合、勝利のモーダルが表示される', () => {
    const winner = 'player2';

    render(<WinnerModal isOpen={true} winner={winner} onClose={mockOnClose} />);

    // モーダルが表示されていることを確認
    const modalElement = screen.getByTestId('winner-modal');
    expect(modalElement).toBeInTheDocument();

    // img要素の取得と検証
    const image = screen.getByAltText('勝利モーダル画像');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/assets/images/winner_modals/win_modal.svg');
  });

  test('モーダルが閉じている場合、何も表示されない', () => {
    render(<WinnerModal isOpen={false} winner={winner} onClose={mockOnClose} />);

    // モーダルが存在しないことを確認
    const modalElement = screen.queryByTestId('winner-modal');
    expect(modalElement).not.toBeInTheDocument();
  });

  test('勝者が決定していない場合、モーダルが表示されない', () => {
    render(<WinnerModal isOpen={true} winner={null} onClose={mockOnClose} />);

    // モーダルが存在しないことを確認
    const modalElement = screen.queryByTestId('winner-modal');
    expect(modalElement).not.toBeInTheDocument();
  });
});