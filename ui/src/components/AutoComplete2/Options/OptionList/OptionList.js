import React from 'react';
import { List } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import InfiniteOptionList from './InfiniteOptionList';
import Divider from './Divider';
import styles from './styles.css';

/**
 * Renders options as an infinite scrollable list and children as static items underneath
 */
const OptionList = ({
  options = new List(),
  optionCount,
  displayCount,
  rowHeight,
  renderOption,
  fetchMore,
  onSelectOption,
  deselectOption,
  children
}) => (
  <div className={styles.optionList}>
    <InfiniteOptionList
      options={options}
      optionCount={optionCount}
      fetchMore={fetchMore}
      displayCount={displayCount}
      rowHeight={rowHeight}
      renderOption={renderOption}
      onSelectOption={onSelectOption}
      deselectOption={deselectOption} />
    { children && <Divider /> }
    { children }
  </div>
);

export default withStyles(styles)(OptionList);
