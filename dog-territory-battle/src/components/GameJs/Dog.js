import React from 'react';
import '../../css/GameCss/Dog.css';

const Dog = ({ dog, onClick, isSelected, isDisabled, style }) => {
  const handleClick = (e) => {
    e.stopPropagation(); // クリックイベントが親に伝播するのを防ぐ
    if (!isDisabled && onClick) {
      onClick(dog, e); // イベントオブジェクトを渡す
    }
  };

  const classNames = ['dog'];
  if (isSelected) classNames.push('selected');
  if (isDisabled) classNames.push('disabled');

  const getImageFileName = (dog) => {
    const base = dog.is_in_hand ? 'handarea' : 'board';
    const name = dog.dog_type?.name?.toLowerCase().replace(/\s+/g, '_');
    return `${base}_${name}_piece.svg`;
  };

  const imageFileName = getImageFileName(dog);

  return (
    <div
      data-testid={`dog-${dog.id}`}
      className={classNames.join(' ')}
      onClick={handleClick}
      style={style}
    >
      <img
        src={`/assets/images/hand_area_pieces/${imageFileName}`}
        alt={dog.name}
        className="dog-img"
      />
    </div>
  );
};

export default Dog;
