import React from 'react';
import { Map } from 'immutable';
import classNames from 'classnames';
import DebounceInput from 'react-debounce-input';
import { InputWrapper } from 'ui/components/AutoComplete2/Inputs/styled';

/**
 * An autocomplete component that can take a multiple selected options and display them
 * will always display a search box at the end of the selected options
 */
const MultiInput = ({
  selectedOptions = new Map(),
  searchString,
  renderOption,
  hasFocus,
  onFocus,
  onChangeSearchString = () => { },
}) => {
  const wrapperClasses = classNames({ open: hasFocus });
  return (
    <InputWrapper className={wrapperClasses}>
      {selectedOptions.map((option, key) =>
        renderOption({ option, key })
      ).valueSeq()}
      <DebounceInput
        debounceTimeout={377}
        value={searchString}
        onChange={onChangeSearchString}
        onFocus={onFocus} />
    </InputWrapper>
  );
};

export default MultiInput;
