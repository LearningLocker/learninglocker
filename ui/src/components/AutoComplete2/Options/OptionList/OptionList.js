import React from 'react';
import { List } from 'immutable';
import styled from 'styled-components';
import InfiniteOptionList from './InfiniteOptionList';

const Divider = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #eee;
`;

const StyledOptionList = styled.div`
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0px 0px 2px 2px;
  background-color: #fff;
`;

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
  <StyledOptionList>
    <InfiniteOptionList
      options={options}
      optionCount={optionCount}
      fetchMore={fetchMore}
      displayCount={displayCount}
      rowHeight={rowHeight}
      renderOption={renderOption}
      onSelectOption={onSelectOption}
      deselectOption={deselectOption} />
    {children && <Divider />}
    {children}
  </StyledOptionList>
);

export default OptionList;
