import React from 'react';
import '../../css/GameCss/ShowCurrentTurn.css';

const ShowCurrentTurn = ({ currentPlayerId }) => {
  return (
    <div className="show-current-turn-wrapper">
      {/* 看板内に配置するdiv */}
      <div className="current-turn-board">
        <div className="current-turn-box">
          プレイヤー{currentPlayerId}のターン
        </div>
        <div className="game-options">
          {/* ここにメインページに戻るなどのボタンを後ほど追加予定 */}
        </div>
      </div>
    </div>
  );
};

export default ShowCurrentTurn;
