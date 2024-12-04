import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import HandArea from '../../components/GameJs/HandArea';
import '@testing-library/jest-dom';

// Dog コンポーネントをモック化
jest.mock('../../components/GameJs/Dog', () => {
  const MockDog = (props) => {
    const { dog, onClick, isSelected, isDisabled } = props;
    return (
      <div
        data-testid={`dog-${dog.id}`}
        onClick={(e) => {
          if (!isDisabled && onClick) {
            onClick(dog, e);
          }
        }}
        className={`dog-mock ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
      >
        {dog.name}
      </div>
    );
  };

  MockDog.displayName = 'Dog';
  return MockDog;
});

const mockOnHandDogClick = jest.fn();
const mockOnHandAreaClick = jest.fn();

const dogs = [
  {
    dog_type: { id: 2, max_steps: 5, movement_type: 'diagonal_orthogonal', name: 'アニキ犬' },
    id: 1,
    is_in_hand: true,
    name: 'アニキ犬',
    player: 1,
    isSelected: false,
  },
];

describe('HandArea Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Dog.js が正しく呼び出されていることを確認する', () => {
    render(
      <HandArea
        handDogs={dogs}
        onHandDogClick={mockOnHandDogClick}
        currentPlayerId={1}
      />
    );

    const dogElement = screen.getByTestId('dog-1');

    // Dog.js のモックがレンダリングされていることを確認
    expect(dogElement).toBeInTheDocument();
    expect(dogElement).toHaveTextContent('アニキ犬');

    // クリックイベントを発火
    fireEvent.click(dogElement);

    // コールバック関数が呼ばれたことを確認
    expect(mockOnHandDogClick).toHaveBeenCalledWith(
      dogs[0],
      expect.any(Object)
    );
  });

  test('現在のプレイヤー以外のコマはクリックしてもコールバックが呼ばれない', () => {
    render(
      <HandArea
        handDogs={dogs}
        onHandDogClick={mockOnHandDogClick}
        currentPlayerId={2} // 現在のプレイヤーIDを 2 に設定
      />
    );

    const dogElement = screen.getByTestId('dog-1');

    // Dog.js のモックがレンダリングされていることを確認
    expect(dogElement).toBeInTheDocument();
    expect(dogElement).toHaveTextContent('アニキ犬');

    // クリックイベントを発火
    fireEvent.click(dogElement);

    // コールバック関数が呼ばれていないことを確認
    expect(mockOnHandDogClick).not.toHaveBeenCalled();
  });

  test('canRemove が true の場合、HandArea がハイライトされる', () => {
    // HandArea をレンダリング
    const { container } = render(
      <HandArea
        handDogs={dogs}
        onHandDogClick={mockOnHandDogClick}
        currentPlayerId={1}
        isHighlighted={true} // HandArea がハイライトされる状態をシミュレート
      />
    );

    // HandArea の要素を取得
    const handAreaElement = container.querySelector('.hand-area');

    // HandArea にハイライトのクラスが適用されていることを確認
    expect(handAreaElement).toHaveClass('highlighted');
  });

  test('HandArea がハイライトされている場合にクリックするとコールバック関数が呼ばれる', () => {
    render(
      <HandArea
        handDogs={dogs}
        onHandDogClick={mockOnHandDogClick}
        onHandAreaClick={mockOnHandAreaClick} // コールバック関数を渡す
        currentPlayerId={1}
        isHighlighted={true}
      />
    );

    const handAreaElement = screen.getByTestId('hand-area');

    // HandArea をクリック
    fireEvent.click(handAreaElement);

    // コールバック関数が呼ばれたことを確認
    expect(mockOnHandAreaClick).toHaveBeenCalledWith(
      1,
      expect.any(Object)
    );
  });

  test('HandArea がハイライトされていない場合にクリックしてもコールバック関数が呼ばれない', () => {
    render(
      <HandArea
        handDogs={dogs}
        onHandDogClick={mockOnHandDogClick}
        onHandAreaClick={mockOnHandAreaClick}
        currentPlayerId={1}
        isHighlighted={false}
      />
    );

    const handAreaElement = screen.getByTestId('hand-area');

    // HandArea をクリック
    fireEvent.click(handAreaElement);

    // コールバック関数が呼ばれていないことを確認
    expect(mockOnHandAreaClick).not.toHaveBeenCalled();
  });
});