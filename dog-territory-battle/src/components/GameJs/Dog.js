// src/components/GameJs/Dog.js
import React from 'react';
import PropTypes from 'prop-types';

const Dog = ({ dog, onClick }) => {
  return (
    <div onClick={() => onClick(dog)} data-testid={`dog-${dog.id}`}>
      {dog.name}
    </div>
  );
};

Dog.propTypes = {
  dog: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    left: PropTypes.number,
    top: PropTypes.number,
    is_in_hand: PropTypes.bool.isRequired,
    dog_type: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      movement_type: PropTypes.string.isRequired,
      max_steps: PropTypes.number.isRequired,
    }).isRequired,
    player: PropTypes.number.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Dog;