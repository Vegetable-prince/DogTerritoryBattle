// src/tests/components/operation_requests.test.js
import apiClient from '../../api/apiClient';
import {
  move_request,
  remove_from_board_request,
  place_on_board_request,
} from '../../api/operation_requests';

jest.mock('../../api/apiClient');

describe('Operation Requests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * move_request のテスト:
   * コマを移動させるリクエストが正しく行われるかを確認
   */
  test('move_request sends correct API call', async () => {
    const selectedDog = { id: 1 };
    const move = { x: 2, y: 3 };
    const mockResponse = { data: 'success' };
    apiClient.post.mockResolvedValue(mockResponse);

    const response = await move_request(selectedDog, move);

    expect(apiClient.post).toHaveBeenCalledWith(`/dogs/${selectedDog.id}/move/`, { move });
    expect(response).toBe(mockResponse);
  });

  /**
   * remove_from_board_request のテスト:
   * コマを手札に戻すリクエストが正しく行われるかを確認
   */
  test('remove_from_board_request sends correct API call', async () => {
    const selectedDog = { id: 2 };
    const mockResponse = { data: 'removed' };
    apiClient.post.mockResolvedValue(mockResponse);

    const response = await remove_from_board_request(selectedDog);

    expect(apiClient.post).toHaveBeenCalledWith(`/dogs/${selectedDog.id}/remove_from_board/`, {});
    expect(response).toBe(mockResponse);
  });

  /**
   * place_on_board_request のテスト:
   * コマを手札から出すリクエストが正しく行われるかを確認
   */
  test('place_on_board_request sends correct API call', async () => {
    const selectedDog = { id: 3 };
    const move = { x: 4, y: 5 };
    const mockResponse = { data: 'placed' };
    apiClient.post.mockResolvedValue(mockResponse);

    const response = await place_on_board_request(selectedDog, move);

    expect(apiClient.post).toHaveBeenCalledWith(`/dogs/${selectedDog.id}/place_on_board/`, { move });
    expect(response).toBe(mockResponse);
  });

  /**
   * エラーハンドリング:
   * API呼び出しが失敗した場合の挙動を確認
   */
  test('move_request handles API errors gracefully', async () => {
    const selectedDog = { id: 1 };
    const move = { x: 2, y: 3 };
    const mockError = new Error('API Error');
    apiClient.post.mockRejectedValue(mockError);

    await expect(move_request(selectedDog, move)).rejects.toThrow('API Error');
    expect(apiClient.post).toHaveBeenCalledWith(`/dogs/${selectedDog.id}/move/`, { move });
  });
});