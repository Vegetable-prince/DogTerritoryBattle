import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Board from '../../components/GameJs/Board';
import '@testing-library/jest-dom';

// Dog コンポーネントをモック化
jest.mock('../../components/GameJs/Dog', () => (props) => {
  const { dog, onClick, isSelected, isDisabled } = props;
  return (
    <div
      data-testid={`dog-${dog.id}`}
      onClick={() => {
        if (!isDisabled && onClick) {
          onClick(dog);
        }
      }}
      className={`dog-mock ${isSelected ? 'selected' : ''} ${
        isDisabled ? 'disabled' : ''
      }`}
    >
      {dog.name}
    </div>
  );
});

describe('Board Component', () => {
  const mockOnBoardDogClick = jest.fn();
  const mockOnBoardSquareClick = jest.fn();

  const boardDogs = [
    {
      dog_type: {
        id: 1,
        max_steps: 1,
        movement_type: 'diagonal_orthogonal',
        name: 'ボス犬',
      },
      id: 1,
      x_position: 0,
      y_position: 0,
      name: 'ボス犬',
      player: 1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Dog.js が正しく呼び出されていることを確認する', () => {
    render(
      <Board
        boardDogs={boardDogs}
        candidatePositions={[]}
        onBoardDogClick={mockOnBoardDogClick}
        onBoardSquareClick={mockOnBoardSquareClick}
        currentPlayerId={1}
      />
    );

    const dogElement = screen.getByTestId('dog-1');

    // Dog.js のモックがレンダリングされていることを確認
    expect(dogElement).toBeInTheDocument();
    expect(dogElement).toHaveTextContent('ボス犬');
  });

  test('ボード上のコマをクリックした際にコールバック関数が呼ばれる（現在のプレイヤーの場合）', () => {
    render(
      <Board
        boardDogs={boardDogs}
        candidatePositions={[]}
        onBoardDogClick={mockOnBoardDogClick}
        onBoardSquareClick={mockOnBoardSquareClick}
        currentPlayerId={1}
      />
    );

    const dogElement = screen.getByTestId('dog-1');

    // クリック
    fireEvent.click(dogElement);

    // コールバック関数が呼ばれたことを確認
    expect(mockOnBoardDogClick).toHaveBeenCalledWith(boardDogs[0]);
  });

  test('ボード上のコマをクリックしてもコールバック関数が呼ばれない（他のプレイヤーの場合）', () => {
    render(
      <Board
        boardDogs={boardDogs}
        candidatePositions={[]}
        onBoardDogClick={mockOnBoardDogClick}
        onBoardSquareClick={mockOnBoardSquareClick}
        currentPlayerId={2}
      />
    );

    const dogElement = screen.getByTestId('dog-1');

    // クリック
    fireEvent.click(dogElement);

    // コールバック関数が呼ばれていないことを確認
    expect(mockOnBoardDogClick).not.toHaveBeenCalled();
  });

  test('ハイライトされたマスをクリックした際にコールバック関数が呼ばれる', () => {
    const candidatePositions = [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];

    render(
      <Board
        boardDogs={boardDogs}
        candidatePositions={candidatePositions}
        onBoardDogClick={mockOnBoardDogClick}
        onBoardSquareClick={mockOnBoardSquareClick}
        currentPlayerId={1}
      />
    );

    // ハイライトされたマス（square）を取得
    const highlightedSquares = screen.getAllByTestId(/^highlighted-square-/);

    // ハイライトされたマスの数を確認
    expect(highlightedSquares.length).toBe(candidatePositions.length);

    // 最初のハイライトされたマスをクリック
    fireEvent.click(highlightedSquares[0]);

    // コールバック関数が呼ばれたことを確認
    expect(mockOnBoardSquareClick).toHaveBeenCalledWith(
      candidatePositions[0].x,
      candidatePositions[0].y,
      expect.any(Object)
    );
  });

  test('コマが縦に4つ並んだ場合にボードの上下枠線が表示される', () => {
    const verticalLineDogs = [
      {
        dog_type: {
          id: 1,
          max_steps: 1,
          movement_type: 'diagonal_orthogonal',
          name: 'ボス犬',
        },
        id: 1,
        x_position: 0,
        y_position: 0,
        name: 'ボス犬',
        player: 1,
      },
      {
        dog_type: {
          id: 2,
          max_steps: 1,
          movement_type: 'orthogonal',
          name: 'ヤイバ犬',
        },
        id: 2,
        x_position: 0,
        y_position: 1 * 100,
        name: 'ヤイバ犬',
        player: 1,
      },
      {
        dog_type: {
          id: 3,
          max_steps: 1,
          movement_type: 'diagonal',
          name: '豆でっぽう犬',
        },
        id: 3,
        x_position: 0,
        y_position: 2 * 100,
        name: '豆でっぽう犬',
        player: 1,
      },
      {
        dog_type: {
          id: 4,
          max_steps: 1,
          movement_type: 'special_hajike',
          name: 'ハジケ犬',
        },
        id: 4,
        x_position: 0,
        y_position: 3 * 100,
        name: 'ハジケ犬',
        player: 1,
      },
    ];

    render(
      <Board
        boardDogs={verticalLineDogs}
        candidatePositions={[]}
        onBoardDogClick={mockOnBoardDogClick}
        onBoardSquareClick={mockOnBoardSquareClick}
        currentPlayerId={1}
      />
    );

    // ボード上の縦ラインの左部分を取得
    const verticalTopLine = screen.getByTestId('line-horizontal-top');
    // ボード上の縦ラインの右部分を取得
    const verticalBottomLine = screen.getByTestId('line-horizontal-bottom');

    // 縦ラインの左部分が存在することを確認
    expect(verticalTopLine).toBeInTheDocument();
    // 縦ラインの右部分が存在することを確認
    expect(verticalBottomLine).toBeInTheDocument();
  });

  test('コマが4つ並んでいない場合、ボードの枠線が表示されない', () => {
    const randomDogs = [
      {
        dog_type: {
          id: 1,
          max_steps: 1,
          movement_type: 'diagonal_orthogonal',
          name: 'ボス犬',
        },
        id: 1,
        x_position: 0,
        y_position: 0,
        name: 'ボス犬',
        player: 1,
      },
      {
        dog_type: {
          id: 2,
          max_steps: 1,
          movement_type: 'orthogonal',
          name: 'ヤイバ犬',
        },
        id: 2,
        x_position: 1 * 100,
        y_position: 0,
        name: 'ヤイバ犬',
        player: 1,
      },
      {
        dog_type: {
          id: 3,
          max_steps: 1,
          movement_type: 'diagonal',
          name: '豆でっぽう犬',
        },
        id: 3,
        x_position: 2 * 100,
        y_position: 0,
        name: '豆でっぽう犬',
        player: 1,
      },
    ];

    render(
      <Board
        boardDogs={randomDogs}
        candidatePositions={[]}
        onBoardDogClick={mockOnBoardDogClick}
        onBoardSquareClick={mockOnBoardSquareClick}
        currentPlayerId={1}
      />
    );

    const boardElement = screen.getByTestId('game-board');

    // ボードの枠線が表示されていないことを確認
    expect(boardElement).not.toHaveClass('border-vertical');
    expect(boardElement).not.toHaveClass('border-horizontal');
  });
});