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

  test('モーダルが開いている場合、勝者の名前が表示される', () => {
    render(<WinnerModal isOpen={true} winner={winner} onClose={mockOnClose} />);

    // モーダルが表示されていることを確認
    const modalElement = screen.getByTestId('winner-modal');
    expect(modalElement).toBeInTheDocument();

    // 勝者の名前が表示されていることを確認
    const winnerText = screen.getByText(`おめでとうございます、${winner}さん！`);
    expect(winnerText).toBeInTheDocument();
  });

  test('モーダルが閉じている場合、何も表示されない', () => {
    render(<WinnerModal isOpen={false} winner={winner} onClose={mockOnClose} />);

    // モーダルが存在しないことを確認
    const modalElement = screen.queryByTestId('winner-modal');
    expect(modalElement).not.toBeInTheDocument();
  });

  test('閉じるボタンをクリックすると onClose が呼ばれる', () => {
    render(<WinnerModal isOpen={true} winner={winner} onClose={mockOnClose} />);

    // 閉じるボタンを取得
    const closeButton = screen.getByTestId('close-button');
    expect(closeButton).toBeInTheDocument();

    // 閉じるボタンをクリック
    fireEvent.click(closeButton);

    // onClose が呼ばれたことを確認
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('勝者が決定していない場合、モーダルが表示されない', () => {
    render(<WinnerModal isOpen={true} winner={null} onClose={mockOnClose} />);

    // モーダルが存在しないことを確認
    const modalElement = screen.queryByTestId('winner-modal');
    expect(modalElement).not.toBeInTheDocument();
  });
});