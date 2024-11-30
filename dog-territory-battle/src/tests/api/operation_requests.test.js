import apiClient from '../../api/apiClient';
import MockAdapter from 'axios-mock-adapter';
import {
  move_request,
  remove_from_board_request,
  place_on_board_request,
  // reset_game_request, // バックエンド未実装のためコメントアウト
  // undo_move_request, // バックエンド未実装のためコメントアウト
} from '../../api/operation_requests';

describe('Operation Requests', () => {
  let mock;

  beforeAll(() => {
    // Axiosのモックアダプターを作成
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    // 各テストケース後にモックをリセット
    mock.reset();
  });

  afterAll(() => {
    // テスト完了後にモックアダプターを復元
    mock.restore();
  });

  /**
   * remove_from_board_request のテスト
   */
  describe('remove_from_board_request', () => {
    const dog = {
      id: 2,
      name: 'アニキ犬',
      x_position: 1,
      y_position: 2,
      is_in_hand: false,
      dog_type: {
        id: 1,
        name: 'アニキ犬',
        movement_type: 'diagonal_orthogonal',
        max_steps: 1,
      },
      player: 1,
    };
    const endpoint = `/dogs/${dog.id}/remove_from_board/`;

    test('remove_from_board_request sends correct API call', async () => {
      const mockResponse = { success: true, message: 'Dog removed from board.' };

      // モックされたエンドポイントに対するレスポンスを設定
      mock.onPost(endpoint, {}).reply(200, mockResponse);

      // onSuccess と onError をモック
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const response = await remove_from_board_request(dog, onSuccess, onError);

      // Axiosのpostが正しいエンドポイントに呼び出されたか確認
      expect(mock.history.post.length).toBe(1);
      expect(mock.history.post[0].url).toBe(endpoint);
      expect(mock.history.post[0].data).toBe(JSON.stringify({})); // 空オブジェクトが送信されていることを確認
      expect(response).toEqual(mockResponse);
      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
      expect(onError).not.toHaveBeenCalled();
    });

    test('remove_from_board_request throws error on failure', async () => {
      // モックされたエンドポイントに対するエラーレスポンスを設定
      mock.onPost(endpoint, {}).reply(404);

      // onSuccess と onError をモック
      const onSuccess = jest.fn();
      const onError = jest.fn();

      await expect(remove_from_board_request(dog, onSuccess, onError))
        .rejects
        .toThrow(`${endpoint} request failed`);

      // Axiosのpostが正しいエンドポイントに呼び出されたか確認
      expect(mock.history.post.length).toBe(1);
      expect(mock.history.post[0].url).toBe(endpoint);
      expect(mock.history.post[0].data).toBe(JSON.stringify({})); // 空オブジェクトが送信されていることを確認
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith('Request failed with status code 404');
    });
  });

  /**
   * place_on_board_request のテスト
   */
  describe('place_on_board_request', () => {
    const dog = {
      id: 3,
      name: 'ボス犬',
      x_position: 1,
      y_position: 2,
      is_in_hand: true,
      dog_type: {
        id: 2,
        name: 'ボス犬',
        movement_type: 'diagonal_orthogonal',
        max_steps: 1,
      },
      player: 1,
    };
    const moveData = { x: 1, y: 1 };
    const endpoint = `/dogs/${dog.id}/place_on_board/`;

    test('place_on_board_request sends correct API call', async () => {
      const mockResponse = { success: true, message: 'Dog placed on board.', dog: { ...dog, x: 1, y: 1 } };

      // モックされたエンドポイントに対するレスポンスを設定
      mock.onPost(endpoint, moveData).reply(200, mockResponse);

      // onSuccess と onError をモック
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const response = await place_on_board_request(dog, moveData, onSuccess, onError);

      // Axiosのpostが正しいエンドポイントとデータで呼び出されたか確認
      expect(mock.history.post.length).toBe(1);
      expect(mock.history.post[0].url).toBe(endpoint);
      expect(JSON.parse(mock.history.post[0].data)).toEqual(moveData); // {x:1, y:1} が送信されていることを確認
      expect(response).toEqual(mockResponse);
      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
      expect(onError).not.toHaveBeenCalled();
    });

    test('place_on_board_request throws error on failure', async () => {
      // モックされたエンドポイントに対するエラーレスポンスを設定
      mock.onPost(endpoint, moveData).reply(400, { message: 'Invalid move.' });

      // onSuccess と onError をモック
      const onSuccess = jest.fn();
      const onError = jest.fn();

      await expect(place_on_board_request(dog, moveData, onSuccess, onError))
        .rejects
        .toThrow(`${endpoint} request failed`);

      // Axiosのpostが正しいエンドポイントとデータで呼び出されたか確認
      expect(mock.history.post.length).toBe(1);
      expect(mock.history.post[0].url).toBe(endpoint);
      expect(JSON.parse(mock.history.post[0].data)).toEqual(moveData); // {x:1, y:1} が送信されていることを確認
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith('Invalid move.');
    });
  });

  /**
   * move_request のテスト
   */
  describe('move_request', () => {
    const dog = {
      id: 4,
      name: 'ボス犬',
      x_position: 2,
      y_position: 3,
      is_in_hand: false,
      dog_type: {
        id: 3,
        name: 'ボス犬',
        movement_type: 'diagonal_orthogonal',
        max_steps: 1,
      },
      player: 1,
    };
    const moveData = { x: 2, y: 3 };
    const endpoint = `/dogs/${dog.id}/move/`;

    test('move_request sends correct API call', async () => {
      const mockResponse = { success: true, message: 'Dog moved successfully.', dog: { ...dog, x: 2, y: 3 } };

      // モックされたエンドポイントに対するレスポンスを設定
      mock.onPost(endpoint, moveData).reply(200, mockResponse);

      // onSuccess と onError をモック
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const response = await move_request(dog, moveData, onSuccess, onError);

      // Axiosのpostが正しいエンドポイントとデータで呼び出されたか確認
      expect(mock.history.post.length).toBe(1);
      expect(mock.history.post[0].url).toBe(endpoint);
      expect(JSON.parse(mock.history.post[0].data)).toEqual(moveData); // {x:2, y:3} が送信されていることを確認
      expect(response).toEqual(mockResponse);
      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
      expect(onError).not.toHaveBeenCalled();
    });

    test('move_request throws error on failure', async () => {
      // モックされたエンドポイントに対するエラーレスポンスを設定
      mock.onPost(endpoint, moveData).reply(400, { message: 'Move not allowed.' });

      // onSuccess と onError をモック
      const onSuccess = jest.fn();
      const onError = jest.fn();

      await expect(move_request(dog, moveData, onSuccess, onError))
        .rejects
        .toThrow(`${endpoint} request failed`);

      // Axiosのpostが正しいエンドポイントとデータで呼び出されたか確認
      expect(mock.history.post.length).toBe(1);
      expect(mock.history.post[0].url).toBe(endpoint);
      expect(JSON.parse(mock.history.post[0].data)).toEqual(moveData); // {x:2, y:3} が送信されていることを確認
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith('Move not allowed.');
    });
  });
});