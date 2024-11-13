import React from 'react';
import PropTypes from 'prop-types';
import '../../css/GameCss/WinnerModal.css';

const WinnerModal = ({ winner, onClose }) => {
  if (!winner) {
    return null;
  }

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="modal" data-testid="winner-modal">
      <div className="modal-content">
        <h2>勝者が決定しました！</h2>
        <p>Player {winner} Wins!</p>
        <button onClick={handleClose}>閉じる</button>
      </div>
    </div>
  );
};

WinnerModal.propTypes = {
  winner: PropTypes.number,
  onClose: PropTypes.func,
};

WinnerModal.defaultProps = {
  winner: null,
  onClose: null,
};

export default WinnerModal;