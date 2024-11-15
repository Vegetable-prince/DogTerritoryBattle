// src/components/GameJs/HandArea.js
import React from 'react';
import PropTypes from 'prop-types';
import Dog from './Dog';

const HandArea = ({
  dogs,
  setHandDogs,
  setBoardDogs,
  switchTurn,
  currentTurn,
  player,
  boardDogs,
  highlighted,
  rulesFunction,
  operationRequest,
}) => {
  if (!Array.isArray(dogs) || dogs.length === 0) {
    return (
      <div data-testid={`hand-area-player-${player}`} className="hand-area ">
        <h3>{`Player ${player} Hand`}</h3>
        <div className="empty-hand">手札に犬がいません</div>
      </div>
    );
  }

  return (
    <div data-testid={`hand-area-player-${player}`} className={`hand-area ${highlighted ? 'highlighted' : ''}`}>
      <h3>{`Player ${player} Hand`}</h3>
      {dogs.map((dog) => (
        <Dog key={dog.id} dog={dog} onClick={() => operationRequest.place_on_board_request(dog, { move: { x: 1, y: 1 } })} />
      ))}
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
      dog_type: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        movement_type: PropTypes.string.isRequired,
        max_steps: PropTypes.number.isRequired,
      }).isRequired,
    })
  ).isRequired,
  setHandDogs: PropTypes.func.isRequired,
  setBoardDogs: PropTypes.func.isRequired,
  switchTurn: PropTypes.func.isRequired,
  currentTurn: PropTypes.number.isRequired,
  player: PropTypes.number.isRequired,
  boardDogs: PropTypes.arrayOf(
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
  highlighted: PropTypes.object,
  rulesFunction: PropTypes.object.isRequired,
  operationRequest: PropTypes.object.isRequired,
};

export default HandArea;