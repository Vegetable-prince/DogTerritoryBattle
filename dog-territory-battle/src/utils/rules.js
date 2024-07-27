export const generateValidMoves = (dog, boardDogs, boardBounds) => {
  const x = dog.left / 100;
  const y = dog.top / 100;
  const possibleMoves = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: 1 }
  ];

  return possibleMoves
      .map(move => ({
          x: x + move.dx,
          y: y + move.dy
      }))
      .filter(move => {
          // 新しいボードの境界を計算
          const newBoardBounds = {
              minX: Math.min(boardBounds.minX, move.x),
              maxX: Math.max(boardBounds.maxX, move.x),
              minY: Math.min(boardBounds.minY, move.y),
              maxY: Math.max(boardBounds.maxY, move.y)
          };

          // 新しい移動がボードのサイズを超えていないかチェック
          if (newBoardBounds.maxX - newBoardBounds.minX >= 4 || newBoardBounds.maxY - newBoardBounds.minY >= 4) {
              return false;
          }

          // 他の駒が既にその位置に存在していないかチェック
          return !boardDogs.some(dog => dog.left / 100 === move.x && dog.top / 100 === move.y);
      });
};

export const generateValidMovesForHandPiece = (boardDogs, boardBounds) => {
  const positions = boardDogs.map(dog => ({
      x: dog.left / 100,
      y: dog.top / 100
  }));

  const possibleMoves = [];
  const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: 1 }
  ];

  positions.forEach(pos => {
      directions.forEach(dir => {
          const newPos = { x: pos.x + dir.dx, y: pos.y + dir.dy };
          const newBoardBounds = {
              minX: Math.min(boardBounds.minX, newPos.x),
              maxX: Math.max(boardBounds.maxX, newPos.x),
              minY: Math.min(boardBounds.minY, newPos.y),
              maxY: Math.max(boardBounds.maxY, newPos.y)
          };

          // 新しい移動がボードのサイズを超えていないかチェック
          if (
              newBoardBounds.maxX - newBoardBounds.minX < 4 &&
              newBoardBounds.maxY - newBoardBounds.minY < 4 &&
              !positions.some(p => p.x === newPos.x && p.y === newPos.y) &&
              !possibleMoves.some(m => m.x === newPos.x && m.y === newPos.y)
          ) {
              possibleMoves.push(newPos);
          }
      });
  });

  return possibleMoves;
};

export const shouldAddSpace = (boardBounds) => {
  // 駒が縦に4つ並んでいる場合、スペースを空ける必要はない
  return boardBounds.maxY - boardBounds.minY < 3;
};
