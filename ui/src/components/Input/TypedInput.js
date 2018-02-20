import React from 'react';
import Input from './Input';

const numberPattern = /^\d+(\.\d+)?$/;

const getTypedValue = (value) => {
  if (numberPattern.test(value)) {
    return parseFloat(value);
  }
  return value;
};

const getStringValue = value => value.toString();

const render = ({ onChange, value, ...props }) => {
  const handleChange = (newValue) => {
    const typedValue = getTypedValue(newValue);
    return onChange(typedValue);
  };
  const stringValue = getStringValue(value);
  return <Input onChange={handleChange} value={stringValue} {...props} />;
};

export default render;
