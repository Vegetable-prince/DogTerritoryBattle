// src/components/GameJs/WinnerModal.js
import React from 'react';
import PropTypes from 'prop-types';

const WinnerModal = ({ winner, onClose, ...props }) => {
  if (!winner) return null;

  return (
    <div {...props}>
      <p>{winner}</p>
      {onClose && <button onClick={onClose}>閉じる</button>}
    </div>
  );
};

WinnerModal.propTypes = {
  winner: PropTypes.string,
  onClose: PropTypes.func,
};

export default WinnerModal;