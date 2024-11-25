/**
 * ルール関数は、ゲームの状態と移動候補マスを受け取り、条件に合致しないマスを除外します。
 * 各関数は同じ形式のデータを受け取り、同じ形式でデータを返します。
 */

const BOARD_WIDTH = 5; // ボードの幅（マス数）
const BOARD_HEIGHT = 5; // ボードの高さ（マス数）
const SQUARE_SIZE = 100; // マスのサイズ（ピクセル）

/**
 * 手札にあるコマの場合のルール関数のパイプライン
 */
export const applyHandRules = (initialData) => {
  return [
    generateOwnAdjacentPositions,
    filterDuplicatePositions,
    checkWouldLose,
    checkOverMaxBoard,
  ].reduce((data, ruleFunction) => {
    return ruleFunction(data);
  }, initialData);
};

/**
 * ボード上にあるコマの場合のルール関数のパイプライン
 */
export const applyBoardRules = (initialData) => {
  return [
    checkBossCantRemove,
    generateMovementPositions,
    filterDuplicatePositions,
    filterNoAdjacentPositions,
    checkWouldLose,
    checkOverMaxBoard,
  ].reduce((data, ruleFunction) => {
    return ruleFunction(data);
  }, initialData);
};

/**
 * 自分のコマに隣接するマスを生成する
 */
const generateOwnAdjacentPositions = (data) => {
  const { boardDogs, playerId } = data;

  // 自分のコマの位置を取得
  const ownDogs = boardDogs.filter((dog) => dog.player === playerId);

  // 隣接マスを生成
  let candidatePositions = [];
  ownDogs.forEach((dog) => {
    const x = dog.left / SQUARE_SIZE;
    const y = dog.top / SQUARE_SIZE;

    const adjacentOffsets = [
      { dx: -1, dy: 0 }, // 左
      { dx: -1, dy: -1 }, // 左上
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: -1 }, // 右上
      { dx: 1, dy: 0 }, // 右
      { dx: 1, dy: 1 }, // 右下
      { dx: 0, dy: 1 }, // 下
      { dx: -1, dy: 1 }, // 左下
    ];

    adjacentOffsets.forEach(({ dx, dy }) => {
      const newX = x + dx;
      const newY = y + dy;

      candidatePositions.push({ x: newX, y: newY });
    });
  });

  // 重複を削除
  candidatePositions = candidatePositions.filter(
    (pos, index, self) =>
      index ===
      self.findIndex((p) => p.x === pos.x && p.y === pos.y)
  );

  return { ...data, candidatePositions };
};

/**
 * 移動タイプに応じて移動可能なマスを生成する
 */
const generateMovementPositions = (data) => {
  const { selectedDog, boardDogs } = data;
  const fromX = selectedDog.left / SQUARE_SIZE;
  const fromY = selectedDog.top / SQUARE_SIZE;
  let candidatePositions = [];

  const MAX_STEPS_LIMIT = 4; // 現実的な上限値を設定

  let maxSteps = selectedDog.dog_type.max_steps;
  if (maxSteps === null) {
    maxSteps = MAX_STEPS_LIMIT;
  }

  const movementType = selectedDog.dog_type.movement_type;

  // ハジケ犬の特殊な移動を処理
  if (movementType === 'special_hajike') {
    // 縦横に2マス進み、その後に曲がって1マス移動
    const orthogonalDirections = [
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: 0 },  // 右
      { dx: 0, dy: 1 },  // 下
      { dx: -1, dy: 0 }, // 左
    ];

    orthogonalDirections.forEach(({ dx, dy }) => {
      const firstX = fromX + dx * 2;
      const firstY = fromY + dy * 2;

      // 曲がる方向（直角方向）
      const turnDirections = orthogonalDirections.filter(
        (dir) => dir.dx !== dx && dir.dy !== dy
      );

      turnDirections.forEach(({ dx: dx2, dy: dy2 }) => {
        const secondX = firstX + dx2;
        const secondY = firstY + dy2;

        // 移動先に他のコマがあるか確認
        const isDestinationOccupied = boardDogs.some(
          (dog) => dog.left / SQUARE_SIZE === secondX && dog.top / SQUARE_SIZE === secondY
        );

        if (!isDestinationOccupied) {
          candidatePositions.push({ x: secondX, y: secondY });
        }
      });
    });

    return { ...data, candidatePositions };
  }

  const directions = [];

  // 移動タイプに応じて方向を設定
  if (movementType.includes('orthogonal')) {
    directions.push({ dx: 0, dy: -1 }); // 上
    directions.push({ dx: 1, dy: 0 });  // 右
    directions.push({ dx: 0, dy: 1 });  // 下
    directions.push({ dx: -1, dy: 0 }); // 左
  }

  if (movementType.includes('diagonal')) {
    directions.push({ dx: -1, dy: -1 }); // 左上
    directions.push({ dx: 1, dy: -1 });  // 右上
    directions.push({ dx: 1, dy: 1 });   // 右下
    directions.push({ dx: -1, dy: 1 });  // 左下
  }

  // 移動可能なマスを生成
  directions.forEach(({ dx, dy }) => {
    for (let step = 1; step <= maxSteps; step++) {
      const newX = fromX + dx * step;
      const newY = fromY + dy * step;

      // マスに他のコマがいるか確認
      const isOccupied = boardDogs.some(
        (dog) => dog.left / SQUARE_SIZE === newX && dog.top / SQUARE_SIZE === newY
      );

      if (isOccupied) {
        // 他のコマがある場合、そのマスには移動できないのでループを終了
        break;
      } else {
        // コマがない場合、移動可能マスに追加
        candidatePositions.push({ x: newX, y: newY });
      }
    }
  });

  return { ...data, candidatePositions };
};

/**
 * 候補マスから既にコマが存在するマスを除外する
 */
const filterDuplicatePositions = (data) => {
  const { candidatePositions, boardDogs } = data;

  const occupiedPositions = boardDogs.map((dog) => ({
    x: dog.left / SQUARE_SIZE,
    y: dog.top / SQUARE_SIZE,
  }));

  const filteredPositions = candidatePositions.filter((pos) => {
    return !occupiedPositions.some(
      (occPos) => occPos.x === pos.x && occPos.y === pos.y
    );
  });

  return { ...data, candidatePositions: filteredPositions };
};

/**
 * 孤立するマスを除外する
 */
const filterNoAdjacentPositions = (data) => {
  const { candidatePositions, boardDogs, selectedDog, canRemove } = data;

  // 自分のコマ以外を取得（選択したコマを除く）
  const otherDogs = boardDogs.filter((dog) => dog.id !== selectedDog.id);

  // 移動による候補マスをフィルタリング
  const filteredPositions = candidatePositions.filter((pos) => {
    // 仮想的にコマを移動した場合のボード状態を作成
    const hypotheticalBoardDogs = [...otherDogs, {
      id: selectedDog.id,
      left: pos.x * SQUARE_SIZE,
      top: pos.y * SQUARE_SIZE,
      player: selectedDog.player,
    }];

    // ボード上の全てのコマが連結しているか確認
    const isConnected = checkBoardConnectivity(hypotheticalBoardDogs);

    return isConnected;
  });

  // コマを手札に戻せるかどうかを判定
  // コマを削除した場合の仮想的なボード状態
  const hypotheticalBoardDogsForRemoval = otherDogs;

  const isConnectedAfterRemoval = checkBoardConnectivity(hypotheticalBoardDogsForRemoval);

  // 既存の canRemove が false の場合は変更しない
  const updatedCanRemove = canRemove === false ? false : isConnectedAfterRemoval;

  return { ...data, candidatePositions: filteredPositions, canRemove: updatedCanRemove };
};

// ボードの連結性をチェックする関数
const checkBoardConnectivity = (dogs) => {
  if (dogs.length === 0) return true;

  // コマの位置をノードとして扱う
  const nodes = dogs.map((dog) => ({
    id: dog.id,
    x: dog.left / SQUARE_SIZE,
    y: dog.top / SQUARE_SIZE,
  }));

  // 隣接リストを作成
  const adjacencyList = new Map();
  nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
  });

  // 隣接関係を構築
  nodes.forEach((node) => {
    nodes.forEach((otherNode) => {
      if (node.id !== otherNode.id) {
        const dx = Math.abs(node.x - otherNode.x);
        const dy = Math.abs(node.y - otherNode.y);
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1)) {
          adjacencyList.get(node.id).push(otherNode.id);
        }
      }
    });
  });

  // DFSで連結性を確認
  const visited = new Set();
  const stack = [nodes[0].id];

  while (stack.length > 0) {
    const currentId = stack.pop();
    if (!visited.has(currentId)) {
      visited.add(currentId);
      const neighbors = adjacencyList.get(currentId);
      neighbors.forEach((neighborId) => {
        if (!visited.has(neighborId)) {
          stack.push(neighborId);
        }
      });
    }
  }

  // 全てのノードが訪問済みか確認
  return visited.size === nodes.length;
};

/**
 * 自身が敗北する可能性のあるマスを除外する
 */
const checkWouldLose = (data) => {
  const { candidatePositions, boardDogs, selectedDog, playerId } = data;

  // 自分のボス犬を取得
  const bossDog = boardDogs.find(
    (dog) => dog.name === 'ボス犬' && dog.player === playerId
  );

  // ボス犬が存在しない場合はそのまま返す
  if (!bossDog) return data;

  // ボス犬の位置
  const bossX = bossDog.left / SQUARE_SIZE;
  const bossY = bossDog.top / SQUARE_SIZE;

  const filteredPositions = candidatePositions.filter((pos) => {
    // 仮想的にコマを配置
    const hypotheticalBoardDogs = [...boardDogs, {
      left: pos.x * SQUARE_SIZE,
      top: pos.y * SQUARE_SIZE,
      player: selectedDog.player,
      dog_type: selectedDog.dog_type,
    }];

    // 仮想的なボード上のコマのx座標とy座標の範囲を取得
    const xs = hypotheticalBoardDogs.map((dog) => dog.left / SQUARE_SIZE);
    const ys = hypotheticalBoardDogs.map((dog) => dog.top / SQUARE_SIZE);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const boardWidth = maxX - minX + 1;
    const boardHeight = maxY - minY + 1;

    // ボードの枠を決定
    const hasLeftEdge = boardWidth >= 4;
    const hasRightEdge = boardWidth >= 4;
    const hasTopEdge = boardHeight >= 4;
    const hasBottomEdge = boardHeight >= 4;

    // ボス犬の上下左右のマスを確認
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 0, dy: 1 },  // 下
      { dx: -1, dy: 0 }, // 左
      { dx: 1, dy: 0 },  // 右
    ];

    let surroundedCount = 0;

    for (const { dx, dy } of directions) {
      const adjacentX = bossX + dx;
      const adjacentY = bossY + dy;

      // ボードの枠に面しているか確認
      let isEdge = false;
      if (dx === -1 && hasLeftEdge && adjacentX < minX) isEdge = true;
      if (dx === 1 && hasRightEdge && adjacentX > maxX) isEdge = true;
      if (dy === -1 && hasTopEdge && adjacentY < minY) isEdge = true;
      if (dy === 1 && hasBottomEdge && adjacentY > maxY) isEdge = true;

      // 敵のコマがいるか確認
      const hasEnemyDog = hypotheticalBoardDogs.some(
        (dog) =>
          dog.left / SQUARE_SIZE === adjacentX &&
          dog.top / SQUARE_SIZE === adjacentY
      );

      if (isEdge || hasEnemyDog) {
        surroundedCount++;
      }
    }

    // 4方向すべてが囲まれている場合、この候補マスを除外
    if (surroundedCount >= 4) {
      return false;
    }

    return true;
  });

  return { ...data, candidatePositions: filteredPositions };
};

/**
 * ボードの最大サイズを超えるマスを除外する
 */
const checkOverMaxBoard = (data) => {
  const { candidatePositions, boardDogs } = data;

  // ボード上のコマのx座標とy座標の範囲を取得
  const xs = boardDogs.map((dog) => dog.left / SQUARE_SIZE);
  const ys = boardDogs.map((dog) => dog.top / SQUARE_SIZE);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const boardWidth = maxX - minX + 1;
  const boardHeight = maxY - minY + 1;

  const isBoardMaxWidth = boardWidth >= 4;
  const isBoardMaxHeight = boardHeight >= 4;

  const filteredPositions = candidatePositions.filter((pos) => {
    if (isBoardMaxWidth && (pos.x < minX || pos.x > maxX)) {
      return false;
    }
    if (isBoardMaxHeight && (pos.y < minY || pos.y > maxY)) {
      return false;
    }
    return true;
  });

  return { ...data, candidatePositions: filteredPositions };
};

/**
 * ボス犬を削除できないようにする
 * また、削除可能な場合は handAreaHighlight フラグを設定する
 */
const checkBossCantRemove = (data) => {
  const { selectedDog } = data;
  let canRemove = true;

  if (selectedDog.name === 'ボス犬') {
    canRemove = false;
  }

  return { ...data, canRemove };
};