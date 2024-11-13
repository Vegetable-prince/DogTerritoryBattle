import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ExtraOperation from '../../components/ExtraOperation';
import '@testing-library/jest-dom';

describe('ExtraOperation Component', () => {
  const mockOnReset = jest.fn();
  const mockOnUndo = jest.fn();

  /**
   * 正常系:
   * ExtraOperationがリセットと巻き戻しのボタンを正しくレンダリングし、クリックイベントがハンドルされるかを確認
   */
  test('renders reset and undo buttons correctly and handles clicks', () => {
    const { getByText } = render(
      <ExtraOperation onReset={mockOnReset} onUndo={mockOnUndo} />
    );

    // リセットボタンが正しく表示されていることを確認
    const resetButton = getByText('リセット');
    expect(resetButton).toBeInTheDocument();

    // 巻き戻しボタンが正しく表示されていることを確認
    const undoButton = getByText('巻き戻し');
    expect(undoButton).toBeInTheDocument();

    // リセットボタンをクリックし、ハンドルされることを確認
    fireEvent.click(resetButton);
    expect(mockOnReset).toHaveBeenCalledTimes(1);

    // 巻き戻しボタンをクリックし、ハンドルされることを確認
    fireEvent.click(undoButton);
    expect(mockOnUndo).toHaveBeenCalledTimes(1);
  });

  /**
   * 異常系:
   * ExtraOperationにハンドラが渡されていない場合、ボタンをクリックしてもエラーが発生しないことを確認
   */
  test('handles clicks gracefully when handlers are missing', () => {
    const { getByText } = render(<ExtraOperation />);

    const resetButton = getByText('リセット');
    const undoButton = getByText('巻き戻し');

    // ボタンをクリックしてもエラーが発生しないことを確認
    expect(() => {
      fireEvent.click(resetButton);
      fireEvent.click(undoButton);
    }).not.toThrow();
  });

  /**
   * エッジケース:
   * ExtraOperationが追加の操作ボタンを持つ場合の表示を確認
   */
  test('renders additional operation buttons if provided', () => {
    const mockOnRedo = jest.fn();
    const additionalButtons = [
      { label: 'やり直し', onClick: mockOnRedo },
    ];

    const { getByText } = render(
      <ExtraOperation onReset={mockOnReset} onUndo={mockOnUndo} additionalButtons={additionalButtons} />
    );

    // 追加のボタンが正しく表示されていることを確認
    const redoButton = getByText('やり直し');
    expect(redoButton).toBeInTheDocument();

    // 追加のボタンをクリックし、ハンドルされることを確認
    fireEvent.click(redoButton);
    expect(mockOnRedo).toHaveBeenCalledTimes(1);
  });

  /**
   * エッジケース:
   * ExtraOperationが大量のボタンを持つ場合の表示を確認
   */
  test('renders correctly with multiple additional operation buttons', () => {
    const mockOnRedo = jest.fn();
    const mockOnSave = jest.fn();
    const additionalButtons = [
      { label: 'やり直し', onClick: mockOnRedo },
      { label: '保存', onClick: mockOnSave },
    ];

    const { getByText } = render(
      <ExtraOperation onReset={mockOnReset} onUndo={mockOnUndo} additionalButtons={additionalButtons} />
    );

    // 追加のボタンが正しく表示されていることを確認
    const redoButton = getByText('やり直し');
    const saveButton = getByText('保存');
    expect(redoButton).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();

    // 追加のボタンをクリックし、ハンドルされることを確認
    fireEvent.click(redoButton);
    fireEvent.click(saveButton);
    expect(mockOnRedo).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });
});