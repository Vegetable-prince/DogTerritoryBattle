import apiClient from './apiClient';

/**
 * 共通のAPIリクエスト関数
 * @param {string} endpoint - エンドポイントのパス
 * @param {Object} data - リクエストボディ
 * @param {Function} onSuccess - 成功時のコールバック
 * @param {Function} onError - エラー時のコールバック
 */
const apiPost = async (endpoint, data, onSuccess, onError) => {
  try {
    const response = await apiClient.post(endpoint, data);

    if (response.status !== 200) {
      throw new Error(`${endpoint} request failed`);
    }

    const responseData = response.data;
    if (onSuccess) {
      onSuccess(responseData);
    }
    return responseData; // Promise を返す
  } catch (error) {
    if (onError) {
      onError(error.response?.data?.message || error.message);
    }
    throw new Error(`${endpoint} request failed`); // カスタムエラーメッセージを投げる
  }
};

/**
 * 移動リクエストを送信する関数
 */
export const move_request = (dog, move, onSuccess, onError) => {
  return apiPost(`/dogs/${dog.id}/move/`, { x: move.x, y: move.y }, onSuccess, onError);
};

/**
 * ボードから削除するリクエストを送信する関数
 */
export const remove_from_board_request = (dog, onSuccess, onError) => {
  return apiPost(`/dogs/${dog.id}/remove_from_board/`, {}, onSuccess, onError);
};

/**
 * ボードに配置するリクエストを送信する関数
 */
export const place_on_board_request = (dog, move, onSuccess, onError) => {
  return apiPost(`/dogs/${dog.id}/place_on_board/`, { x: move.x, y: move.y }, onSuccess, onError);
};

// /**
//  * ゲームをリセットするリクエストを送信する関数
//  */
// export const reset_game_request = (onSuccess, onError) => {
//   return apiPost('/games/reset/', {}, onSuccess, onError);
// };

// /**
//  * ゲームの巻き戻しリクエストを送信する関数
//  */
// export const undo_move_request = (onSuccess, onError) => {
//   return apiPost('/games/undo_move/', {}, onSuccess, onError);
// };