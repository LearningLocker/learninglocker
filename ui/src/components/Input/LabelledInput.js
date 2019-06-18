import React from 'react';
import PropTypes from 'prop-types';
import { compose, setPropTypes, defaultProps } from 'recompose';
import { v4 as uuid } from 'uuid';
import Input from './Input';

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
  const inputId = uuid();
  return (
    <div className="form-group">
      <label htmlFor={inputId} className="control-label">{label}</label>
      <Input id={inputId} placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  );
};

export default enhance(render);
