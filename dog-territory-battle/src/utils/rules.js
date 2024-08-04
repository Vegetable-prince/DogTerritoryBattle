/**
 * 犬の移動可能な座標を生成する関数
 *
 * @param {Object} dog - 移動させる犬のオブジェクト
 * @param {Array} boardDogs - ボード上の犬のリスト
 * @param {Object} boardBounds - ボードの境界情報
 * @returns {Array} - 移動可能な座標のリスト
 */
export const generateValidMoves = (dog, boardDogs, boardBounds) => {
    const x = dog.left / 100;
    const y = dog.top / 100;
    const moves = [];

    const movementType = dog.movement_type;
    const maxSteps = dog.max_steps;
    const directions = getDirections(movementType);

    directions.forEach(direction => {
        let steps = 0;
        while (steps < (maxSteps || Infinity)) {
            const newX = x + direction.dx * (steps + 1);
            const newY = y + direction.dy * (steps + 1);
            const newBoardBounds = {
                minX: Math.min(boardBounds.minX, newX),
                maxX: Math.max(boardBounds.maxX, newX),
                minY: Math.min(boardBounds.minY, newY),
                maxY: Math.max(boardBounds.maxY, newY)
            };

            // ボードのサイズ制限を超えていないかチェック
            if (newBoardBounds.maxX - newBoardBounds.minX >= 4 || newBoardBounds.maxY - newBoardBounds.minY >= 4) {
                break;
            }

            // 他の駒がその位置に存在しないかチェック
            if (boardDogs.some(dog => dog.left / 100 === newX && dog.top / 100 === newY)) {
                break;
            }

            // 移動可能な座標を追加
            moves.push({ x: newX, y: newY });
            steps++;
        }
    });

    return moves;
};

/**
 * 犬ごとの移動先を生成する関数
 *
 * @param {String} type - 移動させる犬のタイプ文字列
 * @returns {Array} - 移動可能な座標のリスト
 */
const getDirections = (type) => {
    switch (type) {
        case 'diagonal_orthogonal':
            // 対角線と直線方向への移動
            return [
                { dx: -1, dy: -1 },
                { dx: 1, dy: -1 },
                { dx: -1, dy: 1 },
                { dx: 1, dy: 1 },
                { dx: 0, dy: -1 },
                { dx: 0, dy: 1 },
                { dx: -1, dy: 0 },
                { dx: 1, dy: 0 }
            ];
        case 'diagonal':
            // 対角線方向への移動
            return [
                { dx: -1, dy: -1 },
                { dx: 1, dy: -1 },
                { dx: -1, dy: 1 },
                { dx: 1, dy: 1 }
            ];
        case 'orthogonal':
            // 直線方向への移動
            return [
                { dx: 0, dy: -1 },
                { dx: 0, dy: 1 },
                { dx: -1, dy: 0 },
                { dx: 1, dy: 0 }
            ];
        case 'special_hajike':
            // 特殊なハジケ犬の移動 (L字型)
            return [
                { dx: 1, dy: 2 },
                { dx: 1, dy: -2 },
                { dx: -1, dy: 2 },
                { dx: -1, dy: -2 },
                { dx: 2, dy: 1 },
                { dx: 2, dy: -1 },
                { dx: -2, dy: 1 },
                { dx: -2, dy: -1 }
            ];
        default:
            // それ以外のタイプの場合、移動できない
            return [];
    }
};

/**
 * 手札の駒の移動可能な座標を生成する関数
 *
 * @param {Array} boardDogs - ボード上の犬のリスト
 * @param {Object} boardBounds - ボードの境界情報
 * @returns {Array} - 移動可能な座標のリスト
 */
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

/**
 * スペースを追加する必要があるかをチェックする関数
 *
 * @param {Object} boardBounds - ボードの境界情報
 * @returns {boolean} - スペースを追加する必要がある場合はtrue
 */
export const shouldAddSpace = (boardBounds) => {
    // 駒が縦に4つ並んでいる場合、スペースを空ける必要はない
    return boardBounds.maxY - boardBounds.minY < 3;
};
