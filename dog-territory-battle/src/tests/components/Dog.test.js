import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Dog from '../../components/GameJs/Dog';
import '@testing-library/jest-dom';

describe('Dog Component', () => {
  const mockOnClick = jest.fn();

  const dog = {
    id: 1,
    name: 'ボス犬',
    dog_type: {
      id: 1,
      name: 'ボス犬',
      movement_type: 'diagonal_orthogonal',
      max_steps: 1,
    },
    player: 1,
    x_position: 0,
    y_position: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Dog コンポーネントが正しくレンダリングされる', () => {
    const { getByTestId } = render(
      <Dog dog={dog} onClick={mockOnClick} isSelected={false} isDisabled={false} />
    );

    const dogElement = getByTestId(`dog-${dog.id}`);

    // コンポーネントが正しくレンダリングされていることを確認
    expect(dogElement).toBeInTheDocument();
    expect(dogElement).toHaveTextContent('ボス犬');
  });

  test('クリック可能な場合、クリックイベントが発火する', () => {
    const { getByTestId } = render(
      <Dog dog={dog} onClick={mockOnClick} isSelected={false} isDisabled={false} />
    );

    const dogElement = getByTestId(`dog-${dog.id}`);

    // クリックイベントを発火
    fireEvent.click(dogElement);

    // コールバック関数が呼ばれたことを確認
    expect(mockOnClick).toHaveBeenCalledWith(
      dog,
      expect.any(Object)
    );
  });

  test('クリック不可の場合、クリックイベントが発火しない', () => {
    const { getByTestId } = render(
      <Dog dog={dog} onClick={mockOnClick} isSelected={false} isDisabled={true} />
    );

    const dogElement = getByTestId(`dog-${dog.id}`);

    // クリックイベントを発火
    fireEvent.click(dogElement);

    // コールバック関数が呼ばれていないことを確認
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  test('選択状態が正しく適用されている', () => {
    const { getByTestId, rerender } = render(
      <Dog dog={dog} onClick={mockOnClick} isSelected={false} isDisabled={false} />
    );

    const dogElement = getByTestId(`dog-${dog.id}`);

    // 選択されていない状態を確認
    expect(dogElement).not.toHaveClass('selected');

    // 選択状態に変更
    rerender(<Dog dog={dog} onClick={mockOnClick} isSelected={true} isDisabled={false} />);

    // 選択されている状態を確認
    expect(dogElement).toHaveClass('selected');
  });

  test('無効化状態が正しく適用されている', () => {
    const { getByTestId } = render(
      <Dog dog={dog} onClick={mockOnClick} isSelected={false} isDisabled={true} />
    );

    const dogElement = getByTestId(`dog-${dog.id}`);

    // 無効化されているクラスが適用されていることを確認
    expect(dogElement).toHaveClass('disabled');
  });
});