import React from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withHandlers, withState } from 'recompose';
import { componentWillReceiveProps } from 'react-functional-lifecycle';
import styles from '../styles.css';

const withFocusState = withState('inputFocused', 'setInputFocused', false);
const withFocusStateHandlers = withHandlers({
  setInputFocusedTrue: props => () => {
    props.setInputFocused(true);
  },
  setInputFocusedFalse: props => () => {
    props.setInputFocused(false);
  }
});

const checkInputFocus = componentWillReceiveProps(({
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
  onChangeSearchString = () => {},
  inputFocused,
  setInputFocusedFalse,
  setInputFocusedTrue
}) => {
  const shouldRenderSearch = hasFocus || !selectedOption;
  const wrapperClasses = classNames({
    [styles.inputWrapper]: true,
    [styles.open]: hasFocus
  });

  let value;
  if (inputFocused) {
    value = searchString;
  } else {
    value = parseOption(selectedOption);
  }

  return (
    <div className={wrapperClasses}>
      { shouldRenderSearch &&
        <input
          type="text"
          onChange={onChangeSearchString}
          onBlur={setInputFocusedFalse}
          onFocus={setInputFocusedTrue}
          placeholder={placeholder}
          value={value} />
      }
      { !shouldRenderSearch &&
        renderOption({ option: selectedOption })
      }
    </div>
  );
};

const enhanced = compose(
  withFocusState,
  withFocusStateHandlers,
  checkInputFocus,
  withStyles(styles)
);

export default enhanced(SingleInput);
