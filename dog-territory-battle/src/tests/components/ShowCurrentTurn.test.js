// src/tests/components/ShowCurrentTurn.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import ShowCurrentTurn from '../../components/GameJs/ShowCurrentTurn';
import '@testing-library/jest-dom';

describe('ShowCurrentTurn Component', () => {
  /**
   * 正常系:
   * 現在のターンが正しく表示されているかを確認
   */
  test('displays current turn correctly', () => {
    render(<ShowCurrentTurn currentTurn={1} />);
    const currentTurn = screen.getByTestId('current-turn');
    expect(currentTurn).toBeInTheDocument();
    expect(currentTurn).toHaveTextContent('現在のターン: Player 1');
  });

  /**
   * 異常系:
   * 現在のターンが `null` の場合、何もレンダリングしないことを確認
   */
  test('does not render current turn when currentTurn prop is missing', () => {
    const { container } = render(<ShowCurrentTurn currentTurn={null} />);

    // コンポーネントが何もレンダリングしないことを確認
    expect(container).toBeEmptyDOMElement();
  });

  /**
   * エッジケース:
   * currentTurn が存在しないプレイヤーIDの場合の挙動を確認
   */
  test('handles invalid currentTurn values gracefully', () => {
    const invalidTurn = -1; // 存在しないプレイヤーID

    const { getByText } = render(<ShowCurrentTurn currentTurn={invalidTurn} />);

    // エラーメッセージやデフォルト表示がある場合、それを確認
    expect(getByText(`現在のターン: Player ${invalidTurn}`)).toBeInTheDocument();
    // ここでは単に表示されるだけなので、エラーメッセージが必要なら追加
  });

  /**
   * エッジケース:
   * currentTurn が大きな値の場合の表示を確認
   */
  test('displays current turn correctly with large player ID', () => {
    const largeTurn = 999;

    const { getByText } = render(<ShowCurrentTurn currentTurn={largeTurn} />);

    // 大きなプレイヤーIDでも正しく表示されることを確認
    expect(getByText(`現在のターン: Player ${largeTurn}`)).toBeInTheDocument();
  });
});