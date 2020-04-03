import React from 'react';
import DebounceInput from 'react-debounce-input';
import { compose, withHandlers, withState } from 'recompose';
import { componentDidUpdate } from 'react-functional-lifecycle';
import { InputWrapper } from 'ui/components/AutoComplete2/Inputs/styled';

const withFocusState = withState('inputFocused', 'setInputFocused', false);
const withFocusStateHandlers = withHandlers({
  setInputFocusedTrue: props => () => {
    props.onFocus();
    props.setInputFocused(true);
  },
  setInputFocusedFalse: props => () => {
    props.setInputFocused(false);
  }
});

const checkInputFocus = componentDidUpdate(({
  hasFocus,
  selectedOption,
  inputFocused,
  setInputFocusedFalse
}) => {
  // It will rendered the other component (renderOption({ option: selectedOption })), so lose focus.
  const shouldRenderSearch = hasFocus || !selectedOption;

  if (!shouldRenderSearch && inputFocused !== false) {
    setInputFocusedFalse();
  }
});

/**
 * An autocomplete component that can take a single selected option and display it,
 * can also be used to search, will use the selected option's display value as the default
 * will display either the selected option or the search input
 */
const SingleInput = ({
  selectedOption,
  placeholder = 'Choose an option',
  searchString = '',
  hasFocus,
  renderOption,
  parseOption = option => option,
  onChangeSearchString = () => { },
  inputFocused,
  setInputFocusedFalse,
  setInputFocusedTrue
}) => {
  const shouldRenderSearch = hasFocus || !selectedOption;

  const value = inputFocused
    ? searchString
    : parseOption(selectedOption);

  return (
    <InputWrapper isFocused={hasFocus}>
      {shouldRenderSearch &&
        <DebounceInput
          debounceTimeout={377}
          value={value}
          placeholder={placeholder}
          onChange={onChangeSearchString}
          onBlur={setInputFocusedFalse}
          onFocus={setInputFocusedTrue} />
      }
      {!shouldRenderSearch &&
        renderOption({ option: selectedOption })
      }
    </InputWrapper>
  );
};

const enhanced = compose(
  withFocusState,
  withFocusStateHandlers,
  checkInputFocus,
);

export default enhanced(SingleInput);
