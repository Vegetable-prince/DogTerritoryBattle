import React from 'react';

const Dog = ({ dog, onClick, isSelected, isDisabled }) => {
  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick(dog);
    }
  };

  const classNames = ['dog'];
  if (isSelected) classNames.push('selected');
  if (isDisabled) classNames.push('disabled');

  return (
    <div
      data-testid={`dog-${dog.id}`}
      className={classNames.join(' ')}
      onClick={handleClick}
    >
      {dog.name}
    </div>
  );
};

export default Dog;