// src/components/GameJs/HandArea.js
import React from 'react';
import PropTypes from 'prop-types';

const HandArea = ({
  dogs,
  setHandDogs,
  setBoardDogs,
  switchTurn,
  currentTurn,
  player,
  boardDogs,
  rulesFunction,
  operationRequest,
  selectedDog,
  setSelectedDog,
  handleRemove,
    ...props
}) => {
  const handleDogClick = (dog) => {
    if (!selectedDog) {
      // 1度目のクリック: rules関数を呼び出す
      rulesFunction.check_duplicate(dog);
      rulesFunction.check_over_max_board(dog);
      rulesFunction.check_own_adjacent(dog);
      rulesFunction.check_would_lose(dog);
      setSelectedDog(dog);
    } else if (selectedDog.id === dog.id) {
      // 2度目のクリック: operation_requestを呼び出す
      operationRequest.place_on_board_request(dog, { move: { x: 1, y: 1 } });
      setSelectedDog(null);
    } else {
      // 別の犬がクリックされた場合: 新たに選択
      setSelectedDog(dog);
      rulesFunction.check_duplicate(dog);
      rulesFunction.check_over_max_board(dog);
      rulesFunction.check_own_adjacent(dog);
      rulesFunction.check_would_lose(dog);
    }
  };

  if (!Array.isArray(dogs) || dogs.length === 0) {
    return (
      <div data-testid={`hand-area-player-${player}`} className="hand-area ">
        <h3>{`Player ${player} Hand`}</h3>
        <div className="empty-hand">手札に犬がいません</div>
      </div>
    );
  }

  return (
    <div className="hand-area" {...props}>
      <h3>Player {player} Hand</h3>
      {dogs.map((dog) => (
        <div
          key={dog.id}
          data-testid={`dog-${dog.id}`}
          onClick={() => handleDogClick(dog)}
        >
          {dog.name}
        </div>
      ))}
      {/* 手札の枠をクリックして削除アクションをトリガー */}
      <div
        className="remove-area"
        data-testid={`remove-area-player-${player}`}
        onClick={handleRemove}
      >
        手札に戻す
      </div>
    </div>
  );
};

HandArea.propTypes = {
  dogs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      left: PropTypes.number,
      top: PropTypes.number,
      is_in_hand: PropTypes.bool.isRequired,
      dog_type: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        movement_type: PropTypes.string.isRequired,
        max_steps: PropTypes.number.isRequired,
      }).isRequired,
      player: PropTypes.number.isRequired,
    })
  ).isRequired,
  setHandDogs: PropTypes.func.isRequired,
  setBoardDogs: PropTypes.func.isRequired,
  switchTurn: PropTypes.func.isRequired,
  currentTurn: PropTypes.number.isRequired,
  player: PropTypes.number.isRequired,
  boardDogs: PropTypes.array.isRequired,
  rulesFunction: PropTypes.shape({
    check_movement_type: PropTypes.func.isRequired,
    check_duplicate: PropTypes.func.isRequired,
    check_over_max_board: PropTypes.func.isRequired,
    check_no_adjacent: PropTypes.func.isRequired,
    check_boss_cant_remove: PropTypes.func.isRequired,
  }).isRequired,
  operationRequest: PropTypes.shape({
    move_request: PropTypes.func.isRequired,
    remove_from_board_request: PropTypes.func.isRequired,
    // 他の関数も必要に応じて定義
  }).isRequired,
  selectedDog: PropTypes.object,
  setSelectedDog: PropTypes.func.isRequired,
  handleRemove: PropTypes.func.isRequired,
};

export default HandArea;