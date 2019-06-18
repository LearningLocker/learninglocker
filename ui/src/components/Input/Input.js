import React from 'react';
import PropTypes from 'prop-types';
import { compose, setPropTypes, defaultProps } from 'recompose';

const enterKey = 13;

const enhance = compose(
  setPropTypes({
    id: PropTypes.string,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    placeholder: PropTypes.string,
    inputRef: PropTypes.func,
  }),
  defaultProps({
    placeholder: '',
    inputRef: () => { },
    onSubmit: () => { },
  }),
);

const render = ({ id, value, onChange, onSubmit, placeholder, inputRef }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };
  const handleKeyDown = (e) => {
    if (e.keyCode === enterKey) {
      onSubmit();
    }
  };
  return (
    <input
      id={id}
      className="form-control"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      ref={inputRef} />
  );
};

export default enhance(render);
