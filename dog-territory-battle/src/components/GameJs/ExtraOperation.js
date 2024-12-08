import React from 'react';
import PropTypes from 'prop-types';
import '../../css/GameCss/ExtraOperation.css';

const ExtraOperation = ({ onReset, onUndo, additionalButtons }) => {
  return (
    <div className="extra-operation" data-testid="extra-operation">
      <button onClick={onReset} data-testid="reset-button">
        リセット
      </button>
      <button onClick={onUndo} data-testid="undo-button">
        巻き戻し
      </button>
      {additionalButtons &&
        additionalButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            data-testid={`additional-button-${index}`}
          >
            {button.label}
          </button>
        ))}
    </div>
  );
};

ExtraOperation.propTypes = {
  onReset: PropTypes.func,
  onUndo: PropTypes.func,
  additionalButtons: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    })
  ),
};

ExtraOperation.defaultProps = {
  onReset: null,
  onUndo: null,
  additionalButtons: [],
};

export default ExtraOperation;