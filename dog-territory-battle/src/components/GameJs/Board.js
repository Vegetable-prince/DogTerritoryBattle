import React from 'react';
import Dog from './Dog';
import '../../css/GameCss/Board.css';

const Board = ({
  boardDogs,
  candidatePositions,
  onBoardDogClick,
  onBoardSquareClick,
  currentPlayerId,
}) => {
  // 縦横の上限チェック
  const checkForLine = () => {
    const xPositions = boardDogs.map((dog) => dog.x_position);
    const yPositions = boardDogs.map((dog) => dog.y_position);

    const minX = Math.min(...xPositions);
    const maxX = Math.max(...xPositions);

    const minY = Math.min(...yPositions);
    const maxY = Math.max(...yPositions);

    const lineTypes = [];
    if (maxX - minX === 3) {
      lineTypes.push('vertical');
    }
    if (maxY - minY === 3) {
      lineTypes.push('horizontal');
    }

    return { lineTypes, minX, maxX, minY, maxY };
  };

  const { lineTypes, minX, maxX, minY, maxY } = checkForLine();

  const renderHighlightedSquares = () => {
    return candidatePositions.map((pos) => (
      <div
        key={`square-${pos.x}-${pos.y}`}
        data-testid={`highlighted-square-${pos.x}-${pos.y}`}
        className="board-square highlighted"
        style={{
          left: (pos.x - minX),
          top: (pos.y - minY),
          width: 1,
          height: 1,
        }}
        onClick={(e) => onBoardSquareClick(pos.x, pos.y, e)}
      ></div>
    ));
  };

  const renderDogs = () => {
        return boardDogs.map((dog) => (
      <Dog
        key={dog.id}
        dog={dog}
        onClick={onBoardDogClick}
        isSelected={dog.isSelected}
        isDisabled={dog.player !== currentPlayerId}
        style={{
          left: (dog.x_position - minX), // 最小xを引く
          top: (dog.y_position - minY), // 最小yを引く
          position: 'absolute'
        }}
      />
    ));
  };

  return (
    <div
      data-testid="game-board"
      className="game-board"
      style={{
        position: 'relative',
        width: `${(maxX - minX + 1)}px`, // 必要な幅に調整
        height: `${(maxY - minY + 1)}px`, // 必要な高さに調整
      }}
    >
      {renderHighlightedSquares()}

      {lineTypes.includes('vertical') && (
        <>
          <div data-testid="line-vertical-left" className="line-vertical-left"></div>
          <div data-testid="line-vertical-right" className="line-vertical-right"></div>
        </>
      )}

      {lineTypes.includes('horizontal') && (
        <>
          <div data-testid="line-horizontal-top" className="line-horizontal-top"></div>
          <div data-testid="line-horizontal-bottom" className="line-horizontal-bottom"></div>
        </>
      )}

      {renderDogs()}
    </div>
  );
};

export default Board;