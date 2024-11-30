import React from 'react';
import '../../css/GameCss/WinnerModal.css';

const WinnerModal = ({ isOpen, winner, onClose }) => {
  if (!isOpen || !winner) return null;

  return (
    <div data-testid="winner-modal" className="modal">
      <div className="modal-content">
        <span data-testid="close-button" className="close" onClick={onClose}>
          &times;
        </span>
        <h2>勝者が決定しました！</h2>
        <p>おめでとうございます、{winner}さん！</p>
      </div>
    </div>
  );
};

export default WinnerModal;