// src/components/GameJs/WinnerModal.js
import React from 'react';
import PropTypes from 'prop-types';

const WinnerModal = ({ winner, onClose }) => {
  if (!winner) return null;

  return (
    <div data-testid="winner-modal">
      <p>{`Player ${winner} Wins!`}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

WinnerModal.propTypes = {
  winner: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default WinnerModal;