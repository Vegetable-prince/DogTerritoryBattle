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
  if (isSelected) {classNames.push('selected');}
  if (isDisabled) {classNames.push('disabled');}

  return (
    <div
      data-testid={`dog-${dog.id}`}
      className={classNames.join(' ')}
      onClick={handleClick}
      style={style}
    >
      {dog.name}
    </div>
  );
};

export default Dog;