import React, { PropTypes } from 'react';
import { compose, setPropTypes, defaultProps } from 'recompose';
import { v4 as uuid } from 'uuid';

const enhance = compose(
  setPropTypes({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
  }),
  defaultProps({
    placeholder: '',
  }),
);

const render = ({ label, value, onChange, placeholder }) => {
  const htmlFor = uuid();
  return (
    <div className="form-group">
      <label htmlFor={htmlFor} className="control-label">{label}</label>
      <input
        id={htmlFor}
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={onChange} />
    </div>
  );
};

export default enhance(render);