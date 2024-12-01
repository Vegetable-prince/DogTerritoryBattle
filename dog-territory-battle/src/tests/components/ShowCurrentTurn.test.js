import React from 'react';
import { render } from '@testing-library/react';
import ShowCurrentTurn from '../../components/GameJs/ShowCurrentTurn';
import '@testing-library/jest-dom';

describe('ShowCurrentTurn Component', () => {
  test('現在のターンが正しく表示される', () => {
    const { getByTestId, rerender } = render(<ShowCurrentTurn currentPlayerId={1} />);

    const currentPlayerElement = getByTestId('current-player');

    // 初期表示が正しいことを確認
    expect(currentPlayerElement).toHaveTextContent("Player 1's Turn");

    // プレイヤー 2 のターンに変更
    rerender(<ShowCurrentTurn currentPlayerId={2} />);
    expect(currentPlayerElement).toHaveTextContent("Player 2's Turn");
  });
});