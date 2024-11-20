// src/utils/rules.js

const BOARD_WIDTH = 5; // ボードの幅（必要に応じて調整）
const BOARD_HEIGHT = 5; // ボードの高さ（必要に応じて調整）

/**
 * 移動タイプを検証する関数
 * @param {Object} dog - 移動する犬のオブジェクト
 * @param {Object} from - 移動前の座標 { x, y }
 * @param {Object} to - 移動後の座標 { x, y }
 * @returns {boolean} - 移動が有効であれば true、無効であれば false
 */
export const check_movement_type = (dog, from, to) => {
    // 移動がない場合は無効
    if (from.x === to.x && from.y === to.y) return false;

    // ボードの境界外への移動を無効
    if (to.x < 0 || to.x >= BOARD_WIDTH || to.y < 0 || to.y >= BOARD_HEIGHT) return false;

    const dx = Math.abs(to.x - from.x) * 100; // 1ステップ = 100ピクセル
    const dy = Math.abs(to.y - from.y) * 100;

    switch (dog.dog_type.movement_type) {
        case 'orthogonal':
            // 直線方向に最大ステップ数以内で移動
            return (
                (dx === 0 || dy === 0) && (dx + dy) / 100 <= dog.dog_type.max_steps
            );
        case 'diagonal':
            // 斜め方向に最大ステップ数以内で移動
            return dx === dy && (dx / 100) <= dog.dog_type.max_steps;
        case 'diagonal_orthogonal':
            // 斜めまたは直線方向に最大ステップ数以内で移動
            return (
                (dx === dy || dx === 0 || dy === 0) &&
                (dx + dy) / 100 <= dog.dog_type.max_steps
            );
        case 'special_hajike':
            // ハジケハトの特殊な移動パターン
            // 例: (2,2) -> (4,3) または (2,2) -> (0,1) に移動
            if (dog.name === 'ハジケハト') {
                return (
                    (dx === 200 && dy === 100) || // (2,2) -> (4,3)
                    (dx === 100 && dy === 200)    // (2,2) -> (0,1)
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
    if (!Array.isArray(boardDogs)) return false;
    return boardDogs.some((d) => d.left === dog.left && d.top === dog.top && d.id !== dog.id);
};

/**
 * ボード上の犬の数が最大を超えているかをチェック
 * @param {Array} boardDogs - ボード上の犬のリスト
 * @param {number} maxBoard - ボード上の最大犬数（デフォルトは10）
 * @returns {boolean} - 最大数を超えていれば true、そうでなければ false
 */
export const check_over_max_board = (boardDogs, maxBoard = 10) => {
    if (!Array.isArray(boardDogs)) return false;
    return boardDogs.length >= maxBoard;
};

/**
 * 移動先に隣接する犬が存在しないかをチェック
 * @param {Object} dog - チェックする犬のオブジェクト
 * @param {Array} boardDogs - ボード上の犬のリスト
 * @returns {boolean} - 隣接する犬がなければ true、そうでなければ false
 */
export const check_no_adjacent = (dog, boardDogs) => {
    if (!Array.isArray(boardDogs)) return true;
    return !boardDogs.some((d) => {
        const dx = Math.abs(d.left - dog.left);
        const dy = Math.abs(d.top - dog.top);
        return (dx <= 100 && dy <= 100) && d.id !== dog.id;
    });
};

/**
 * 自分の犬が隣接しているかをチェック
 * @param {Object} dogPosition - チェックする犬の位置 { x, y }
 * @param {Array} boardDogs - ボード上の犬のリスト
 * @param {number} playerId - プレイヤーID
 * @returns {boolean} - 隣接していれば true、そうでなければ false
 */
export const check_own_adjacent = (dogPosition, boardDogs, playerId) => {
    if (!Array.isArray(boardDogs)) return false;
    return boardDogs.some((d) => {
        if (d.player !== playerId) return false;
        const dx = Math.abs(d.left - dogPosition.x * 100); // 座標をピクセルに変換
        const dy = Math.abs(d.top - dogPosition.y * 100);
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
 * @returns {boolean} - ボス犬の場合は false、そうでなければ true
 */
export const check_boss_cant_remove = (dog) => {
    if (dog.name === 'ボス犬') {
        return false; // ボス犬は削除できない
    }
    return true; // その他の犬は削除できる
};