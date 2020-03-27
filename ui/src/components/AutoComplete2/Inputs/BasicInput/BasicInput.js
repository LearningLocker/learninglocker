import React from 'react';
import classNames from 'classnames';
import DebounceInput from 'react-debounce-input';
import { InputWrapper } from 'ui/components/AutoComplete2/Inputs/styled';

/**
 * A basic text input component with some default styling
 */
const BasicInput = ({
  value,
  onChange = () => { },
  hasFocus,
  onFocus,
}) => {
  const classes = classNames({ open: hasFocus });
  return (
    <InputWrapper className={classes}>
      <DebounceInput
        className="form-control"
        debounceTimeout={377}
        value={value}
        onChange={onChange}
        onFocus={onFocus} />
    </InputWrapper>
  );
};

export default BasicInput;
