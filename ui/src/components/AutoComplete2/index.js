import React from 'react';
import { compose, withState } from 'recompose';
import FocusGroup from 'ui/components/FocusGroup/FocusGroup';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

/**
 * renders an autocomplete component with an input and suggestions
 */
const AutoComplete = ({
  // renderers
  renderOptions = () => {},
  renderInput = () => {},

  // event handlers
  onKeyPress,

  // local state
  hasInputFocus,
  setInputFocus,
}) => {
  const onBlurInput = () => {
    setInputFocus(false);
  };

  return (
    <div onKeyPress={onKeyPress} className={styles.wrapper}>
      <FocusGroup
        onFocus={() => setInputFocus(true)}
        onBlur={onBlurInput}
        hasFocus={hasInputFocus} >
        {renderInput({
          hasFocus: hasInputFocus
        })}
        <div
          className={styles.optionsWrapper}>
          {hasInputFocus &&
            renderOptions({ onKeyPress, onBlur: onBlurInput })
          }
        </div>
      </FocusGroup>
    </div>
  );
};

const inputFocusState = withState('hasInputFocus', 'setInputFocus', false);
const optionsFocusState = withState('hasOptionFocus', 'setOptionFocus', false);
const focusState = compose(inputFocusState, optionsFocusState);

export default compose(
  withStyles(styles),
  focusState
)(AutoComplete);
