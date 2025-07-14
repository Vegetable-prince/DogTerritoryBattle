import React from 'react';
import '../../css/GameCss/WinnerModal.css';

const WinnerModal = ({ isOpen, winner }) => {
  if (!isOpen || !winner) return null;

  const imageSrc =
    winner === "player1"
      ? '/assets/images/winner_modals/lose_modal.svg'
      : winner === "player2"
      ? '/assets/images/winner_modals/win_modal.svg'
      : '';

  const altText = winner === "player1" ? '敗北モーダル画像' : '勝利モーダル画像';

  return (
    <div data-testid="winner-modal" className="modal">
      <div className="modal-content">
        <img
          src={imageSrc}
          alt={altText}
          className="winner-image"
        />
      </div>
    </div>
  );
};

export default WinnerModal;
