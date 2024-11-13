import React from 'react';
import PropTypes from 'prop-types';
import '../../css/GameCss/Dog.css';

const Dog = ({ dog, onClick }) => {
  if (dog.isHidden) {
    return null;
  }

  const handleClick = () => {
    if (onClick) {
      onClick(dog);
    }
  };

  const dogClasses = ['dog'];
  if (!dog.currentTurn) {
    dogClasses.push('not-current-turn');
  }

  return (
    <div
      className={dogClasses.join(' ')}
      onClick={handleClick}
      data-testid={`dog-${dog.id}`}
      style={{ left: dog.left, top: dog.top, position: 'absolute' }}
    >
      {dog.name}
    </div>
  );
};

Dog.propTypes = {
  dog: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    currentTurn: PropTypes.bool,
    isHidden: PropTypes.bool,
    left: PropTypes.number,
    top: PropTypes.number,
    player: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func,
};

Dog.defaultProps = {
  onClick: null,
};

export default Dog;