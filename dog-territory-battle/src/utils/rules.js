/**
 * ルール関数は、ゲームの状態と移動候補マスを受け取り、条件に合致しないマスを除外します。
 * 各関数は同じ形式のデータを受け取り、同じ形式でデータを返します。
 */

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
    checkWouldLose,
    checkOverMaxBoard,
    filterNoAdjacentPositions,
  ].reduce((data, ruleFunction) => {
    return ruleFunction(data);
  }, initialData);
};

/**
 * ボードの範囲（最小・最大座標）と幅・高さを計算するヘルパー関数
 * @param {Array} boardDogs - ボード上の全コマ
 * @param {Object} [options] - オプションオブジェクト
 * @param {Object} [options.candidatePosition] - 移動候補マス（オプション）
 * @returns {Object} - minX, maxX, minY, maxY, boardWidth, boardHeight
 */
const calculateBoardBounds = (boardDogs, options = {}) => {
  let allX = boardDogs.map((dog) => dog.x_position);
  let allY = boardDogs.map((dog) => dog.y_position);

  if (options.candidatePosition) {
    allX.push(options.candidatePosition.x);
    allY.push(options.candidatePosition.y);
  }

  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  const boardWidth = maxX - minX + 1;
  const boardHeight = maxY - minY + 1;

  return { minX, maxX, minY, maxY, boardWidth, boardHeight };
};

/**
 * ボス犬が囲まれているかどうかを判定するヘルパー関数
 * @param {Object} bossDog - ボス犬のオブジェクト
 * @param {Array} boardDogs - ボード上の全コマ
 * @param {number} playerId - 現在のプレイヤーID
 * @param {Object} boardBounds - ボードの範囲情報
 * @returns {boolean} - 囲まれている場合は true, そうでない場合は false
 */
const isBossSurrounded = (bossDog, boardDogs, playerId, boardBounds) => {
  const { minX, maxX, minY, maxY, boardWidth, boardHeight } = boardBounds;
  const bossX = bossDog.x_position;
  const bossY = bossDog.y_position;

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
    if (dx === -1 && boardWidth >= 4 && adjacentX < minX) {isEdge = true;}
    if (dx === 1 && boardWidth >= 4 && adjacentX > maxX) {isEdge = true;}
    if (dy === -1 && boardHeight >= 4 && adjacentY < minY) {isEdge = true;}
    if (dy === 1 && boardHeight >= 4 && adjacentY > maxY) {isEdge = true;}

    // 敵のコマがいるか確認
    const hasEnemyDog = boardDogs.some(
      (dog) =>
        dog.x_position === adjacentX &&
        dog.y_position === adjacentY
    );

    if (isEdge || hasEnemyDog) {
      surroundedCount++;
    }
  }

  // 4方向すべてが囲まれている場合
  return surroundedCount >= 4;
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
    const x = dog.x_position;
    const y = dog.y_position;

    const adjacentOffsets = [
      { dx: -1, dy: 0 },  // 左
      { dx: -1, dy: -1 }, // 左上
      { dx: 0, dy: -1 },  // 上
      { dx: 1, dy: -1 },  // 右上
      { dx: 1, dy: 0 },   // 右
      { dx: 1, dy: 1 },   // 右下
      { dx: 0, dy: 1 },   // 下
      { dx: -1, dy: 1 },  // 左下
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
  const fromX = selectedDog.x_position;
  const fromY = selectedDog.y_position;
  let candidatePositions = [];

  const MAX_STEPS_LIMIT = 4; // 現実的な上限値を設定

  let maxSteps = selectedDog.dog_type.max_steps ? selectedDog.dog_type.max_steps : null;
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
          (dog) => dog.x_position === secondX && dog.y_position === secondY
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
        (dog) => dog.x_position === newX && dog.y_position === newY
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
    x: dog.x_position,
    y: dog.y_position,
  }));

  const filteredPositions = candidatePositions.filter((pos) => {
    return !occupiedPositions.some(
      (occPos) => occPos.x === pos.x && occPos.y === pos.y
    );
  });

  return { ...data, candidatePositions: filteredPositions };
};

/**
 * 自身が敗北する可能性のあるマスを除外する
 */
const checkWouldLose = (data) => {
  const { candidatePositions, boardDogs, selectedDog, playerId } = data;

  // 自分のボス犬を取得（仮想ボード上で再取得）
  const filteredPositions = candidatePositions.filter((pos) => {
    // 仮想的にコマを配置（元の位置から削除して新しい位置に追加）
    const hypotheticalBoardDogs = [
      ...boardDogs.filter(dog => dog.id !== selectedDog.id),
      {
        ...selectedDog,
        x_position: pos.x,
        y_position: pos.y,
      },
    ];

    // 仮想ボード上での自分のボス犬を取得
    const bossDog = hypotheticalBoardDogs.find(
      (dog) => dog.name === 'ボス犬' && dog.player === playerId
    );

    // ボス犬が存在しない場合は除外しない
    if (!bossDog) {return true;}

    const boardBounds = calculateBoardBounds(hypotheticalBoardDogs);

    // 囲み判定
    const isSurrounded = isBossSurrounded(bossDog, hypotheticalBoardDogs, playerId, boardBounds);

    // 囲まれている場合は除外
    return !isSurrounded;
  });

  return { ...data, candidatePositions: filteredPositions };
};

/**
 * ボードの最大サイズを超えるマスを除外する
 */
const checkOverMaxBoard = (data) => {
  const { candidatePositions, boardDogs } = data;

  const MAX_WIDTH = 4;
  const MAX_HEIGHT = 4;

  const filteredPositions = candidatePositions.filter((pos) => {
    // 選択されたコマをその位置に配置した場合のボード範囲を計算
    const { boardWidth, boardHeight } = calculateBoardBounds(boardDogs, {
      candidatePosition: pos,
    });

    // ボードの幅または高さが最大枠を超える場合は除外
    if (boardWidth > MAX_WIDTH || boardHeight > MAX_HEIGHT) {
      return false;
    }

    return true;
  });

  return { ...data, candidatePositions: filteredPositions };
};

/**
 * ボス犬を削除できないようにする
 * また、削除可能な場合は canRemove フラグを設定する
 */
const checkBossCantRemove = (data) => {
  const { selectedDog } = data;
  let canRemove = true;
  if (selectedDog && selectedDog.name === 'ボス犬') {
    canRemove = false;
  }

  return { ...data, canRemove };
};

/**
 * 孤立するマスを除外し、canRemove を適切に設定する
 */
const filterNoAdjacentPositions = (data) => {
  const { candidatePositions, boardDogs, selectedDog, canRemove } = data;

  // 自分のコマ以外を取得（選択したコマを除く）
  const otherDogs = boardDogs.filter((dog) => dog.id !== selectedDog.id);

  // 移動による候補マスをフィルタリング
  const filteredPositions = candidatePositions.filter((pos) => {
    // 仮想的にコマを移動した場合のボード状態を作成
    const hypotheticalDog = {
      ...selectedDog,
      x_position: pos.x,
      y_position: pos.y,
    };

    // 新しいボード状態（他のコマ + 仮想的に移動したコマ）
    const newBoardDogs = [...otherDogs, hypotheticalDog];

    // すべてのコマが少なくとも1つの隣接するコマを持っているかを確認
    const allHaveAdjacent = newBoardDogs.every((dog) => {
      return hasAdjacentDog(dog, newBoardDogs.filter((d) => d.id !== dog.id));
    });

    return allHaveAdjacent;
  });

  // canRemove が true の場合のみ、コマを手札に戻す操作で孤立するコマが存在するかをチェック
  let updatedCanRemove = canRemove;

  if (canRemove) {
    // コマを手札に戻す操作をシミュレート（selectedDog を手札に戻す）
    const boardDogsAfterRemoval = boardDogs.filter((dog) => dog.id !== selectedDog.id);

    // ボード上の各コマが少なくとも1つの隣接するコマを持っているかを確認
    const anyIsolatedAfterRemoval = boardDogsAfterRemoval.some((dog) => {
      return !hasAdjacentDog(dog, boardDogsAfterRemoval.filter((d) => d.id !== dog.id));
    });

    if (anyIsolatedAfterRemoval) {
      updatedCanRemove = false;
    }
  }

  return {
    ...data,
    candidatePositions: filteredPositions,
    canRemove: updatedCanRemove,
  };
};

/**
 * 指定した位置に隣接するコマが存在するか確認
 */
const hasAdjacentDog = (dog, otherDogs) => {
  const x = dog.x_position;
  const y = dog.y_position;

  const adjacentPositions = [
    { x: x - 1, y: y - 1 },
    { x: x, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x - 1, y: y },
    { x: x + 1, y: y },
    { x: x - 1, y: y + 1 },
    { x: x, y: y + 1 },
    { x: x + 1, y: y + 1 },
  ];

  return adjacentPositions.some((pos) =>
    otherDogs.some(
      (otherDog) =>
        otherDog.x_position === pos.x &&
        otherDog.y_position === pos.y
    )
  );
};