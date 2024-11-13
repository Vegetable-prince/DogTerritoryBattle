import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Dog from './Dog';
import '../../css/GameCss/HandArea.css';
import {
  check_duplicate,
  check_over_max_board,
  check_own_adjacent,
  check_would_lose,
} from '../../utils/rules';
import {
  place_on_board_request,
} from '../../api/operation_requests';

const HandArea = ({
  dogs,
  setHandDogs,
  setBoardDogs,
  switchTurn,
  currentTurn,
  player,
  boardDogs, // 追加
}) => {
  const [selectedDog, setSelectedDog] = useState(null);
  const [highlightedMoves, setHighlightedMoves] = useState([]);
  const [error, setError] = useState(null); // エラーメッセージの状態

  const handleDogClick = async (dog) => {
    if (!selectedDog) {
      // 1度目のクリック: ルール関数を呼び出す
      const isDuplicate = check_duplicate(dog, boardDogs);
      const isOverMax = check_over_max_board(dog, boardDogs, 10); // 最大10匹と仮定
      const hasAdjacent = check_own_adjacent(dog, boardDogs);
      const wouldLose = check_would_lose(dog);

      if (!isDuplicate && !isOverMax && hasAdjacent && !wouldLose) {
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
      // 2度目のクリック: place_on_board_request を呼び出す
      try {
        await place_on_board_request(
          selectedDog,
          { x: 100, y: 100 }, // 例として固定の座標を使用
          (data) => {
            // 成功時のコールバック
            setHandDogs((prevDogs) => prevDogs.filter((d) => d.id !== selectedDog.id));
            setBoardDogs((prevDogs) => [
              ...prevDogs,
              { ...selectedDog, is_in_hand: false, left: 100, top: 100 },
            ]);
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
    <div className={`hand-area ${selectedDog ? 'highlighted' : ''}`} data-testid={`hand-area-player-${player}`}>
      <h3>Player {player} Hand</h3>
      {dogs && dogs.length > 0 ? (
        dogs.map((dog) => (
          <Dog key={dog.id} dog={dog} onClick={handleDogClick} />
        ))
      ) : (
        <div className="empty-hand">手札に犬がいません</div>
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
      {/* エラーメッセージの表示 */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

HandArea.propTypes = {
  dogs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      is_in_hand: PropTypes.bool.isRequired,
      player: PropTypes.number.isRequired,
      left: PropTypes.number,
      top: PropTypes.number,
      dog_type: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        movement_type: PropTypes.string.isRequired,
        max_steps: PropTypes.number,
      }).isRequired,
    })
  ).isRequired,
  setHandDogs: PropTypes.func.isRequired,
  setBoardDogs: PropTypes.func.isRequired,
  switchTurn: PropTypes.func.isRequired,
  currentTurn: PropTypes.number.isRequired,
  player: PropTypes.number.isRequired,
  boardDogs: PropTypes.arrayOf( // 追加
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
};

export default HandArea;