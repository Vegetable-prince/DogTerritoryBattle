import React from 'react';
import Dog from './Dog';

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
      onClick={() => {
        if (isHighlighted && onHandAreaClick) {
          onHandAreaClick();
        }
      }}
    >
      {handDogs.map((dog) => (
        <Dog
          key={dog.id}
          dog={dog}
          onClick={() => {
            if (dog.player === currentPlayerId && onHandDogClick) {
              onHandDogClick(dog);
            }
          }}
          isSelected={false}
          isDisabled={dog.player !== currentPlayerId}
        />
      ))}
    </div>
  );
};

export default HandArea;