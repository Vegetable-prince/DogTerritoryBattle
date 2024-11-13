import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Dog from './Dog';
import '../../css/GameCss/Board.css';
import {
  check_movement_type,
  check_duplicate,
  check_over_max_board,
  check_no_adjacent,
  check_would_lose,
  check_boss_cant_remove,
} from '../../utils/rules';
import {
  move_request,
  remove_from_board_request,
} from '../../api/operation_requests';

const Board = ({
  dogs,
  setBoardDogs,
  switchTurn,
  currentTurn,
}) => {
  const [selectedDog, setSelectedDog] = useState(null);
  const [highlightedMoves, setHighlightedMoves] = useState([]);
  const [error, setError] = useState(null); // エラーメッセージの状態

  const handleDogClick = async (dog) => {
    if (!selectedDog) {
      // 1度目のクリック: ルール関数を呼び出す
      const isMovementTypeValid = check_movement_type(dog, { x: dog.left, y: dog.top }, { x: dog.left + 100, y: dog.top + 100 }); // 仮の座標
      const isDuplicate = check_duplicate(dog, dogs);
      const isOverMax = check_over_max_board(dog, dogs, 10); // 最大10匹と仮定
      const hasNoAdjacent = check_no_adjacent(dog, dogs);
      const wouldLose = check_would_lose(dog);
      const isBossCantRemove = check_boss_cant_remove(dog);

      if (
        isMovementTypeValid &&
        !isDuplicate &&
        !isOverMax &&
        hasNoAdjacent &&
        !wouldLose &&
        isBossCantRemove
      ) {
        // ハイライトマスを取得（仮定: 固定の座標を使用）
        const highlights = [
          { x: dog.left + 100, y: dog.top }, // 右方向
          { x: dog.left, y: dog.top + 100 }, // 下方向
        ];

        setHighlightedMoves(highlights);
        setSelectedDog(dog);
      } else {
        // ルールに違反している場合の処理
        setError('移動がルールに違反しています。');
        setTimeout(() => setError(null), 3000); // 3秒後にエラーをクリア
      }
    } else {
      // 2度目のクリック: move_request を呼び出す
      try {
        await move_request(
          selectedDog,
          { x: 100, y: 100 }, // 例として固定の座標を使用
          (data) => {
            // 成功時のコールバック
            setBoardDogs((prevDogs) =>
              prevDogs.map((d) =>
                d.id === selectedDog.id ? { ...d, left: 100, top: 100 } : d
              )
            );
            setSelectedDog(null);
            setHighlightedMoves([]);
            switchTurn();
          },
          (errorMessage) => {
            // エラー時のコールバック
            setError(errorMessage);
            setTimeout(() => setError(null), 3000); // 3秒後にエラーをクリア
          }
        );
      } catch (err) {
        // 予期しないエラーのハンドリング
        setError('予期しないエラーが発生しました。');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleRemoveClick = async (dog) => {
    if (selectedDog) {
      try {
        await remove_from_board_request(
          selectedDog,
          (data) => {
            // 成功時のコールバック
            setBoardDogs((prevDogs) => prevDogs.filter((d) => d.id !== selectedDog.id));
            setSelectedDog(null);
            setHighlightedMoves([]);
            switchTurn();
          },
          (errorMessage) => {
            // エラー時のコールバック
            setError(errorMessage);
            setTimeout(() => setError(null), 3000); // 3秒後にエラーをクリア
          }
        );
      } catch (err) {
        // 予期しないエラーのハンドリング
        setError('予期しないエラーが発生しました。');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  return (
    <div className="board" data-testid="game-board">
      {dogs && dogs.length > 0 ? (
        dogs.map((dog) => (
          <Dog key={dog.id} dog={dog} onClick={handleDogClick} />
        ))
      ) : (
        <div className="empty-board">ボードに犬がいません</div>
      )}
      {/* ハイライトマスの表示 */}
      {highlightedMoves.map((move, index) => (
        <div
          key={index}
          className="valid-move"
          style={{
            left: move.x,
            top: move.y,
            position: 'absolute',
            width: '100px',
            height: '100px',
          }}
          data-testid={`highlight-${selectedDog ? selectedDog.id : 'unknown'}-${index}`}
          onClick={() => handleDogClick(selectedDog)}
        />
      ))}
      {/* 追加オプション: コマを手札に戻すボタン */}
      {selectedDog && (
        <button
          className="remove-button"
          onClick={() => handleRemoveClick(selectedDog)}
          data-testid="remove-button"
        >
          手札に戻す
        </button>
      )}
      {/* エラーメッセージの表示 */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

Board.propTypes = {
  dogs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      left: PropTypes.number.isRequired,
      top: PropTypes.number.isRequired,
      is_in_hand: PropTypes.bool.isRequired,
      dog_type: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        movement_type: PropTypes.string.isRequired,
        max_steps: PropTypes.number,
      }).isRequired,
      player: PropTypes.number.isRequired,
    })
  ).isRequired,
  setBoardDogs: PropTypes.func.isRequired,
  switchTurn: PropTypes.func.isRequired,
  currentTurn: PropTypes.number.isRequired,
};

export default Board;