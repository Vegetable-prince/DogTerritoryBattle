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
  // 縦横の上限チェック（コマが4マス分並んだときに枠線を表示するため）
  const checkForLine = () => {
    const xPositions = boardDogs.map((dog) => dog.x_position);
    const yPositions = boardDogs.map((dog) => dog.y_position);

    const minX = Math.min(...xPositions);
    const maxX = Math.max(...xPositions);

    const minY = Math.min(...yPositions);
    const maxY = Math.max(...yPositions);

    const lineTypes = [];
    if (maxX - minX === 3) {
      lineTypes.push('vertical'); // 縦ライン
    }
    if (maxY - minY === 3) {
      lineTypes.push('horizontal'); // 横ライン
    }

    return { lineTypes, minX, maxX, minY, maxY };
  };

  // ライン判定結果を取得
  const { lineTypes, minX, maxX, minY, maxY } = checkForLine();

  const renderHighlightedSquares = () => {
    return candidatePositions.map((pos) => (
      <div
        key={`square-${pos.x}-${pos.y}`}
        data-testid={`highlighted-square-${pos.x}-${pos.y}`}
        className="board-square highlighted"
        style={{
          '--x-position': pos.x + 1, // CSS Gridは1-based index
          '--y-position': pos.y + 1,
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
          '--x-position': dog.x_position + 1,
          '--y-position': dog.y_position + 1,
        }}
      />
    ));
  };

  return (
    <div data-testid="game-board" className="game-board">
      {/* ハイライトされたマス */}
      {renderHighlightedSquares()}

      {/* コマを描画 */}
      {renderDogs()}

      {/* 縦の枠線（4マス分のライン条件が成立した場合） */}
      {lineTypes.includes('vertical') && (
        <>
          <div data-testid="line-vertical-left" className="line-vertical-left"></div>
          <div data-testid="line-vertical-right" className="line-vertical-right"></div>
        </>
      )}

      {/* 横の枠線（4マス分のライン条件が成立した場合） */}
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