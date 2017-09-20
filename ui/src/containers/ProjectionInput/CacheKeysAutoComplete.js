import React from 'react';
import AutoComplete2 from 'ui/components/AutoComplete2';
import CacheKeysOptionList from 'ui/components/AutoComplete2/Options/CacheKeysOptionList/CacheKeysOptionList';
import BasicInput from 'ui/components/AutoComplete2/Inputs/BasicInput/BasicInput';
import { withState, compose, withHandlers } from 'recompose';
import { Map } from 'immutable';

const withFilter = withState('filter', 'setFilter');

const renderInput = ({ setFilter, onChange, value }) => ({ hasFocus }) => (
  <BasicInput
    value={value}
    onChange={(e) => {
      const newVal = e.target.value;
      setFilter(new Map({ searchString: { $regex: newVal, $options: 'i' } }));
      onChange(newVal);
    }}
    hasFocus={hasFocus} />
);

const withSelectOptionBlur = withHandlers({
  selectOptionBlur: ({ onSelectOption }) => onBlur => (option) => {
    onSelectOption(option);
    onBlur();
  }
});

const renderOptions = (onSelectOption, filter, selectOptionBlur) => ({ onBlur }) => (
  <CacheKeysOptionList
    onSelectOption={selectOptionBlur(onBlur)}
    filter={filter}
    parseTooltip={option => option.get('searchString')} />
);

export const render = ({
  setFilter,
  filter,
  onSelectOption,
  value,
  onChange,
  selectOptionBlur
}) => (
  <AutoComplete2
    renderInput={renderInput({ setFilter, onChange, value })}
    renderOptions={renderOptions(onSelectOption, filter, selectOptionBlur)} />
  );

export default compose(
  withFilter,
  withSelectOptionBlur
)(render);
