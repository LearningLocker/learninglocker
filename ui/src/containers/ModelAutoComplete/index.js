import React from 'react';
import { Map } from 'immutable';
import { compose, withProps, withState } from 'recompose';
import AutoComplete2 from 'ui/components/AutoComplete2';
import ModelInput from 'ui/components/AutoComplete2/Inputs/SingleInput/ModelInput';
import ModelOptionList from 'ui/components/AutoComplete2/Options/ModelOptionList/ModelOptionList';

const withSelectedOption = compose(
  withState('selectedId', 'setSelectedId'),
  withProps(({ setSelectedId, onChange }) => ({
    selectOption: (option) => {
      onChange(option);
      setSelectedId(option.get('_id'));
    },
    deselectOption: () => {
      onChange(null);
      setSelectedId(null);
    }
  }))
);

// stores a filter based on search input, merges it with any existing filters
const withSearchFilter = compose(
  withState('searchFilter', 'setSearchFilter'),
  withProps(({ filter = new Map(), searchFilter = new Map() }) => ({
    filter: filter.mergeDeep(searchFilter)
  }))
);

const ModelAutoComplete = ({
  schema,
  filter,
  sort,
  id,
  setSearchFilter,
  searchFilter,
  selectOption,
  deselectOption,
  selectedId,
  parseOption,
  parseOptionString,
  parseOptionTooltip,
  searchStringToFilter,
  searchFilterToString = searchFilter2 => searchFilter2 && searchFilter2.first() && searchFilter2.first().get('$regex') || '',
  displayCount,
  fields,
  placeholder,
  defaultValues,
  defaultNewValues,
  canEdit = () => true,
}) => {
  const searchString = searchFilterToString(searchFilter);

  return (
    <AutoComplete2
      renderInput={({ hasFocus, onFocus }) => (
        <ModelInput
          onFocus={onFocus}
          placeholder={placeholder}
          fields={fields}
          defaultValues={defaultValues}
          parseOption={option => (option ? ((parseOptionString && parseOptionString(option)) || parseOption(option)) : '')}
          parseOptionTooltip={option => (option ? parseOptionTooltip(option) : '')}
          schema={schema}
          id={id || selectedId}
          deselectOption={deselectOption}
          hasFocus={hasFocus}
          searchStringToFilter={searchStringToFilter}
          onChangeFilter={searchFilter2 => setSearchFilter(searchFilter2)}
          searchString={searchString}
          canEdit={canEdit} />
      )}
      renderOptions={({ onBlur }) => (
        <ModelOptionList
          fields={fields}
          sort={sort}
          defaultValues={defaultValues}
          defaultNewValues={defaultNewValues}
          onSelectOption={(option) => { selectOption(option); onBlur(); }}
          deselectOption={() => { deselectOption(); onBlur(); }}
          parseOption={option => (option ? parseOption(option) : '')}
          parseOptionTooltip={option => (option ? parseOptionTooltip(option) : '')}
          filter={filter}
          schema={schema}
          displayCount={displayCount}
          canEdit={canEdit} />
      )} />
  );
};

export default compose(
  withSelectedOption,
  withSearchFilter
)(ModelAutoComplete);
