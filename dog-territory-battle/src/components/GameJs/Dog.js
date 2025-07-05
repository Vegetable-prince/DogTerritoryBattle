import React from 'react';
import '../../css/GameCss/Dog.css';

const Dog = ({ dog, onClick, isSelected, isDisabled, style }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    if (!isDisabled && onClick) {
      onClick(dog, e);
    }
  };

  const classNames = ['dog'];
  if (isSelected) classNames.push('selected');
  if (isDisabled) classNames.push('disabled');

  const getImageFileName = (dog) => {
    const baseFolder = dog.is_in_hand ? 'hand_area_pieces' : 'board_pieces';
    const name = dog.dog_type?.name?.toLowerCase().replace(/\s+/g, '_');
    return `/assets/images/${baseFolder}/${baseFolder === 'hand_area_pieces' ? 'handarea' : 'board'}_${name}_piece.svg`;
  };

  const imageSrc = getImageFileName(dog);

  return (
    <div
      data-testid={`dog-${dog.id}`}
      className={classNames.join(' ')}
      onClick={handleClick}
      style={{
        ...style,
        left: `calc(var(--x-position) * var(--dog-size))`,
        top: `calc(var(--y-position) * var(--dog-size))`,
      }}
    >
      <img
        src={imageSrc}
        alt={dog.name}
        className="dog-img"
      />
    </div>
  );
};

export default Dog;
