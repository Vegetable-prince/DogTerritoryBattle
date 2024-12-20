import React from 'react';
import Dog from './Dog';
import '../../css/GameCss/HandArea.css';

const HandArea = ({
  handDogs,
  onHandDogClick,
  onHandAreaClick,
  currentPlayerId,
  isHighlighted,
}) => {
  return (
    <div
      data-testid="hand-area"
      className={`hand-area ${isHighlighted ? 'highlighted' : ''}`}
      onClick={(e) => {
        e.stopPropagation(); // 背景クリックイベントを防止
        if (isHighlighted && onHandAreaClick) {
          onHandAreaClick(currentPlayerId, e); // イベントを渡す
        }
      }}
    >
      {handDogs.map((dog) => (
        <Dog
          key={dog.id}
          dog={dog}
          onClick={(dog, e) => onHandDogClick(dog, e)}
          isSelected={dog.isSelected}
          isDisabled={dog.player !== currentPlayerId}
        />
      ))}
    </div>
  );
};

export default HandArea;