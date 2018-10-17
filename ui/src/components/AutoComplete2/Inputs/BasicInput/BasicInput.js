import React from 'react';
import classNames from 'classnames';
import DebounceInput from 'react-debounce-input';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from '../styles.css';

/**
 * A basic text input component with some default styling
 */
const BasicInput = ({
  value,
  onChange = () => {},
  hasFocus,
  onFocus,
}) => {
  const classes = classNames({
    [styles.inputWrapper]: true,
    [styles.open]: hasFocus
  });
  return (
    <div className={classes}>
      <DebounceInput
        className="form-control"
        debounceTimeout={377}
        value={value}
        onChange={onChange}
        onFocus={onFocus} />
    </div>
  );
};

export default withStyles(styles)(BasicInput);
