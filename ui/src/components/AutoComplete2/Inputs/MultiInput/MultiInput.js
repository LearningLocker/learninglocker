import React from 'react';
import { Map } from 'immutable';
import classNames from 'classnames';
import DebounceInput from 'react-debounce-input';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from '../styles.css';

/**
 * An autocomplete component that can take a multiple selected options and display them
 * will always display a search box at the end of the selected options
 */
const MultiInput = ({
  selectedOptions = new Map(),
  searchString,
  renderOption,
  hasFocus,
  onChangeSearchString = () => {},
}) => {
  const wrapperClasses = classNames({
    [styles.inputWrapper]: true,
    [styles.open]: hasFocus
  });
  return (
    <div className={wrapperClasses}>
      {selectedOptions.map((option, key) =>
        renderOption({ option, key })
      ).valueSeq()}
      <DebounceInput
        debounceTimeout={377}
        value={searchString}
        onChange={onChangeSearchString} />
    </div>
  );
};

export default withStyles(styles)(MultiInput);
