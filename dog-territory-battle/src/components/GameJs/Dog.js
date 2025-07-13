import React from 'react';
import '../../css/GameCss/Dog.css';

const Dog = ({ dog, onClick, isSelected, isDisabled, style, currentPlayerId }) => {
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
    const playerFolder = `player_${dog.player}`;
    const name = dog.dog_type?.name?.toLowerCase().replace(/\s+/g, '_');
    
    if (dog.is_in_hand) {
      // hand_area_piecesの場合：将来的にプレイヤー別対応予定
      // 現在は従来通りの形式を維持
      return `/assets/images/${baseFolder}/handarea_${name}_piece.svg`;
    } else {
      // board_piecesの場合：プレイヤー別画像を使用
      return `/assets/images/${baseFolder}/${playerFolder}/board_${name}_piece_${dog.player}.svg`;
    }
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
