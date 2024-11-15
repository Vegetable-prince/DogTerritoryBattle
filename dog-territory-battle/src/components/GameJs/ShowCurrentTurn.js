// src/components/GameJs/ShowCurrentTurn.js
import React from 'react';
import PropTypes from 'prop-types';

const ShowCurrentTurn = ({ currentTurn }) => {
  if (currentTurn === null || currentTurn === undefined) return null;

  return (
    <div data-testid="current-turn">
      <p>{`現在のターン: Player ${currentTurn}`}</p>
    </div>
  );
};

ShowCurrentTurn.propTypes = {
  currentTurn: PropTypes.number.isRequired,
};

export default ShowCurrentTurn;