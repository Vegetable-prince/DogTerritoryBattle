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
  const checkForLine = () => {
    const xPositions = boardDogs.map((dog) => dog.x_position);
    const yPositions = boardDogs.map((dog) => dog.y_position);

    const minX = Math.min(...xPositions);
    const maxX = Math.max(...xPositions);
    const minY = Math.min(...yPositions);
    const maxY = Math.max(...yPositions);

    const lineTypes = [];
    if (maxX - minX === 3) lineTypes.push('vertical');
    if (maxY - minY === 3) lineTypes.push('horizontal');

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
          '--x-position': pos.x - minX,
          '--y-position': pos.y - minY,
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
        currentPlayerId={currentPlayerId}
        style={{
          '--x-position': dog.x_position - minX,
          '--y-position': dog.y_position - minY,
          position: 'absolute',
          width: '75px',
          height: '75px',
        }}
      />
    ));
  };

  return (
    <div
      data-testid="game-board"
      className="game-board"
      style={{
        '--board-width': maxX - minX + 1,
        '--board-height': maxY - minY + 1,
      }}
    >
      {renderHighlightedSquares()}
      {renderDogs()}

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
    </div>
  );
};

export default Board;
