// src/components/GameJs/Board.js
import React from 'react';
import PropTypes from 'prop-types';
import '../../css/GameCss/Board.css';

const Board = ({ dogs, setBoardDogs, switchTurn, currentTurn, rulesFunction, operationRequest, selectedDog, setSelectedDog }) => {

  const handleDogClick = (dog) => {
    if (!selectedDog) {
      // 1度目のクリック: ルール関数を呼び出す
      rulesFunction.check_movement_type(dog, { move: { x: 1, y: 1 } });
      rulesFunction.check_duplicate(dog, { move: { x: 1, y: 1 } });
      rulesFunction.check_over_max_board(dog, { move: { x: 1, y: 1 } });
      rulesFunction.check_no_adjacent(dog, { move: { x: 1, y: 1 } });
      rulesFunction.check_boss_cant_remove(dog, { move: { x: 1, y: 1 } });
      setSelectedDog(dog);
    } else {
      if (dog.id === selectedDog.id) {
        // 同じ犬をクリック: 選択を解除
        setSelectedDog(null);
      } else {
        // 異なる犬をクリック: move_request を呼び出す
        operationRequest.move_request(selectedDog, { move: { x: 1, y: 1 } }, () => {}, () => {});
        setSelectedDog(null);
      }
    }
  };

  return (
    <div className="board" data-testid="game-board">
      {dogs.map((dog) => (
        <div
          key={dog.id}
          data-testid={`dog-${dog.id}`}
          style={{
            position: 'absolute',
            left: `${dog.left}px`,
            top: `${dog.top}px`,
          }}
          onClick={(e) => {
            e.stopPropagation(); // ボード全体のクリックイベントを防ぐ
            handleDogClick(dog);
          }}
        >
          {dog.name}
        </div>
      ))}
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
        max_steps: PropTypes.number.isRequired,
      }).isRequired,
      player: PropTypes.number.isRequired,
    })
  ).isRequired,
  setBoardDogs: PropTypes.func.isRequired,
  switchTurn: PropTypes.func.isRequired,
  currentTurn: PropTypes.number.isRequired,
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
  }).isRequired,
  selectedDog: PropTypes.object,
  setSelectedDog: PropTypes.func.isRequired,
};

export default Board;