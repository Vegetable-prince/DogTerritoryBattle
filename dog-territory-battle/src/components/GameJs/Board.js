import React from 'react';
import Dog from './Dog';

const SQUARE_SIZE = 100;
const BOARD_COLUMNS = 4;
const BOARD_ROWS = 4;
const BOARD_WIDTH = SQUARE_SIZE * BOARD_COLUMNS; // 400
const BOARD_HEIGHT = SQUARE_SIZE * BOARD_ROWS; // 400

const Board = ({
  boardDogs,
  candidatePositions,
  onBoardDogClick,
  onBoardSquareClick,
  currentPlayerId,
}) => {
  // ボード上の犬の位置をグリッドに変換
  const createGrid = () => {
    const grid = Array.from({ length: BOARD_ROWS }, () =>
      Array(BOARD_COLUMNS).fill(false)
    );

    boardDogs.forEach((dog) => {
      const x = dog.left / SQUARE_SIZE;
      const y = dog.top / SQUARE_SIZE;
      grid[y][x] = true;
    });

    return grid;
  };

  // ラインのチェック
  const checkForLine = () => {
    const grid = createGrid();

    // 縦方向のチェック
    for (let x = 0; x < BOARD_COLUMNS; x++) {
      let count = 0;
      for (let y = 0; y < BOARD_ROWS; y++) {
        if (grid[y][x]) {
          count++;
          if (count === 4) {
            return 'vertical';
          }
        } else {
          count = 0;
        }
      }
    }

    // 横方向のチェック
    for (let y = 0; y < BOARD_ROWS; y++) {
      let count = 0;
      for (let x = 0; x < BOARD_COLUMNS; x++) {
        if (grid[y][x]) {
          count++;
          if (count === 4) {
            return 'horizontal';
          }
        } else {
          count = 0;
        }
      }
    }

    return null;
  };

  const lineType = checkForLine();

  const boardClasses = ['game-board'];
  if (lineType === 'vertical') {
    boardClasses.push('border-vertical');
  } else if (lineType === 'horizontal') {
    boardClasses.push('border-horizontal');
  }

  // ハイライトされたマス（square）をレンダリング
  const renderHighlightedSquares = () => {
    return candidatePositions.map((pos) => (
      <div
        key={`square-${pos.x}-${pos.y}`}
        data-testid={`highlighted-square-${pos.x}-${pos.y}`}
        className="board-square highlighted"
        style={{
          position: 'absolute',
          left: pos.x * SQUARE_SIZE,
          top: pos.y * SQUARE_SIZE,
          width: SQUARE_SIZE,
          height: SQUARE_SIZE,
        }}
        onClick={() => onBoardSquareClick(pos.x, pos.y)}
      ></div>
    ));
  };

  // ボード上の犬のコマをレンダリング
  const renderDogs = () => {
    return boardDogs.map((dog) => (
      <div
        key={dog.id}
        style={{
          position: 'absolute',
          left: dog.left,
          top: dog.top,
        }}
      >
        <Dog
          dog={dog}
          onClick={() => {
            if (dog.player === currentPlayerId) {
              onBoardDogClick(dog);
            }
          }}
          isSelected={false} // 状態に応じて変更
          isDisabled={dog.player !== currentPlayerId}
        />
      </div>
    ));
  };

  return (
    <div
      data-testid="game-board"
      className={boardClasses.join(' ')}
      style={{
        position: 'relative',
        width: BOARD_WIDTH,
        height: BOARD_HEIGHT,
      }}
    >
      {/* ハイライトされたマス（square） */}
      {renderHighlightedSquares()}

      {/* 犬のコマ */}
      {renderDogs()}
    </div>
  );
};

export default Board;