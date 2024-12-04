import React from 'react';

const ShowCurrentTurn = ({ currentPlayerId }) => {
  return (
    <div data-testid="current-player">Player {currentPlayerId}&apos;s Turn</div>
  );
};

export default ShowCurrentTurn;