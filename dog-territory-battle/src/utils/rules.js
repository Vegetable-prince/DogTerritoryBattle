/**
 * 移動タイプを検証する関数
 * @param {Object} dog - 移動する犬のオブジェクト
 * @param {Object} from - 移動前の座標 { x, y }
 * @param {Object} to - 移動後の座標 { x, y }
 * @returns {boolean} - 移動が有効であれば true、無効であれば false
 */
export const check_movement_type = (dog, from, to) => {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);

    switch (dog.movement_type) {
        case 'orthogonal':
            // 直線方向に最大ステップ数以内で移動
            return (
                (dx === 0 || dy === 0) && (dx + dy) / 100 <= dog.max_steps
            );
        case 'diagonal':
            // 斜め方向に最大ステップ数以内で移動
            return dx === dy && (dx / 100) <= dog.max_steps;
        case 'diagonal_orthogonal':
            // 斜めまたは直線方向に最大ステップ数以内で移動
            return (
                (dx === dy || dx === 0 || dy === 0) &&
                (dx + dy) / 100 <= dog.max_steps
            );
        case 'special_hajike':
            // ハジケハトの特殊な移動パターン
            // 例: (2,2) -> (4,3) または (0,1) に移動
            if (dog.name === 'ハジケハト') {
                return (
                    (dx === 200 && dy === 100) ||
                    (dx === 200 && dy === 100)
                );
            }
            return false;
        default:
            return false;
    }
};

/**
 * 移動先に重複する犬が存在するかをチェック
 * @param {Object} dog - チェックする犬のオブジェクト
 * @param {Array} boardDogs - ボード上の犬のリスト
 * @returns {boolean} - 重複していれば true、そうでなければ false
 */
export const check_duplicate = (dog, boardDogs) => {
    return boardDogs.some((d) => d.left === dog.left && d.top === dog.top && d.id !== dog.id);
};

/**
 * ボード上の犬の数が最大を超えているかをチェック
 * @param {Object} dog - チェックする犬のオブジェクト
 * @param {Array} boardDogs - ボード上の犬のリスト
 * @param {number} maxBoard - ボード上の最大犬数（デフォルトは10）
 * @returns {boolean} - 最大数を超えていれば true、そうでなければ false
 */
export const check_over_max_board = (dog, boardDogs, maxBoard = 10) => {
    return boardDogs.length >= maxBoard;
};

/**
 * 移動先に隣接する犬が存在しないかをチェック
 * @param {Object} dog - チェックする犬のオブジェクト
 * @param {Array} boardDogs - ボード上の犬のリスト
 * @returns {boolean} - 隣接する犬がなければ true、そうでなければ false
 */
export const check_no_adjacent = (dog, boardDogs) => {
    return !boardDogs.some((d) => {
        const dx = Math.abs(d.left - dog.left);
        const dy = Math.abs(d.top - dog.top);
        return (dx <= 100 && dy <= 100) && d.id !== dog.id;
    });
};

/**
 * 自分の犬が隣接しているかをチェック
 * @param {Object} dog - チェックする犬のオブジェクト
 * @param {Array} boardDogs - ボード上の犬のリスト
 * @returns {boolean} - 隣接していれば true、そうでなければ false
 */
export const check_own_adjacent = (dog, boardDogs) => {
    return boardDogs.some((d) => {
        const dx = Math.abs(d.left - dog.left);
        const dy = Math.abs(d.top - dog.top);
        return (dx === 100 && dy === 0) || (dx === 0 && dy === 100) || (dx === 100 && dy === 100);
    });
};

/**
 * 移動によって自分が負けるかをチェック
 * @param {Object} dog - チェックする犬のオブジェクト
 * @returns {boolean} - 負ける場合は true、そうでなければ false
 */
export const check_would_lose = (dog) => {
    // ゲームの具体的なロジックに基づいて実装
    // ここでは仮に常に false を返す
    return false;
};

/**
 * ボス犬を削除できないかをチェック
 * @param {Object} dog - チェックする犬のオブジェクト
 * @returns {boolean} - 削除できなければ true、そうでなければ false
 */
export const check_boss_cant_remove = (dog) => {
    if (dog.name === 'ボス犬') {
        return false; // ボス犬は削除できない
    }
    return true;
};