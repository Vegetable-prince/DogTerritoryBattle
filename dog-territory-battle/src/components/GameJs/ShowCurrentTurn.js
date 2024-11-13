import React from 'react';
import PropTypes from 'prop-types';
import '../../css/GameCss/ShowCurrentTurn.css';

const ShowCurrentTurn = ({ currentTurn }) => {
  return (
    <div className="current-turn" data-testid="current-turn">
      <p>現在のターン: Player {currentTurn}</p>
    </div>
  );
};

ShowCurrentTurn.propTypes = {
  currentTurn: PropTypes.number.isRequired,
};

export default ShowCurrentTurn;