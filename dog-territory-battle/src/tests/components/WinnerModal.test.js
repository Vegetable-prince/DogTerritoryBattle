// src/tests/components/WinnerModal.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import WinnerModal from '../../components/GameJs/WinnerModal';
import '@testing-library/jest-dom';

describe('WinnerModal Component', () => {
  const mockOnClose = jest.fn();

  /**
   * 正常系:
   * 勝者メッセージが正しく表示され、閉じるボタンが機能することを確認
   */
  test('renders winner message correctly and handles close', () => {
    const winner = 'Player 1';
    const winnerMessage = `おめでとうございます、${winner}さんが勝ちました！`;

    const { getByText } = render(
      <WinnerModal
        winner={winnerMessage}
        onClose={mockOnClose}
        data-testid="winner-modal"
      />
    );

    // 勝者メッセージが正しく表示されていることを確認
    expect(getByText(winnerMessage)).toBeInTheDocument();

    // 閉じるボタンが表示されていることを確認
    const closeButton = getByText('閉じる');
    expect(closeButton).toBeInTheDocument();

    // 閉じるボタンをクリック: onClose が呼ばれることを確認
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  /**
   * 異常系:
   * 勝者メッセージが `null` の場合、何もレンダリングしないことを確認
   */
  test('does not render winner message when winner prop is null', () => {
    const { container } = render(
      <WinnerModal
        winner={null}
        onClose={mockOnClose}
        data-testid="winner-modal"
      />
    );

    // コンポーネントが何もレンダリングしないことを確認
    expect(container).toBeEmptyDOMElement();
  });

  /**
   * 異常系:
   * `onClose` プロップが未提供の場合の動作確認
   */
  test('does not render close button when onClose prop is missing', () => {
    const winnerMessage = "おめでとうございます、Player 1さんが勝ちました！";

    // `onClose` を渡さずに WinnerModal をレンダリング
    const { queryByText } = render(
      <WinnerModal
        winner={winnerMessage}
        data-testid="winner-modal"
      />
    );

    // 閉じるボタンが表示されていないことを確認
    expect(queryByText('閉じる')).not.toBeInTheDocument();
  });

  /**
   * エッジケース:
   * `winner` が `undefined` の場合、何もレンダリングしないことを確認
   */
  test('does not render when winner is undefined', () => {
    const { container } = render(
      <WinnerModal
        winner={undefined}
        onClose={mockOnClose}
        data-testid="winner-modal"
      />
    );

    // コンポーネントが何もレンダリングしないことを確認
    expect(container).toBeEmptyDOMElement();
  });

  /**
   * エッジケース:
   * 複数の勝者が提供された場合の動作確認
   */
  test('renders only one winner message even if multiple winners are provided', () => {
    const winnerMessage = 'おめでとうございます、Player 1, Player 2さんが勝ちました！';

    const { getAllByText } = render(
      <WinnerModal
        winner={winnerMessage}
        onClose={mockOnClose}
        data-testid="winner-modal"
      />
    );

    // 勝者メッセージが1つだけ表示されていることを確認
    const messages = getAllByText(/おめでとうございます、Player 1, Player 2さんが勝ちました！/i);
    expect(messages.length).toBe(1);
  });
});