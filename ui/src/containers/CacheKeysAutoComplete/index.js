import React from 'react';
import { Map } from 'immutable';
import { compose, withProps, withState, withHandlers } from 'recompose';
import { withSchema } from 'ui/utils/hocs';
import AutoComplete2 from 'ui/components/AutoComplete2';
import OptionListItem from 'ui/components/OptionListItem';
import OptionList from 'ui/components/AutoComplete2/Options/OptionList/OptionList';
import SingleInput from 'ui/components/AutoComplete2/Inputs/SingleInput/SingleInput';

const includes = ys => xs => xs.toLowerCase().indexOf(ys) !== -1;

const renderOption = ({
  useTooltip = false,
  onFocus = () => {},
}) => ({
  option = new Map(),
  onSelectOption = () => {}
}) => {
  const out = (
    <OptionListItem
      data={option}
      label={option.get('searchString')}
      tooltip={useTooltip ? option.get('searchString') : null}
      onClick={(event) => {
        onFocus(event);
        onSelectOption(event);
      }} />
  );
  return out;
};

const withSearchString = withState('searchString', 'setSearchString');

const withCacheKeys = compose(
  withProps(({ filter = new Map(), searchString = '' }) => ({
    filter: filter.merge(new Map({
      searchString: { $regex: searchString, $options: 'i' }
    }))
  })),
  withSchema('querybuildercache'),
  withProps(({ models }) => ({
    models: models.mapKeys((k, model) => model.get('searchString')).map(model =>
      model.set('optionKey', model.get('searchString'))
    )
  }))
);

const withLocalKeys = compose(
  withProps(({ localOptions, searchString = '' }) => ({
    localOptions: localOptions.filter(option =>
      includes(searchString.toLowerCase())(option.get('searchString'))
    )
  })),
);

const withSelectOptionBlur = withHandlers({
  selectOptionBlur: ({ onSelectOption }) => onBlur => (option) => {
    onSelectOption(option);
    onBlur();
  }
});

const withKeys = compose(
  withSearchString,
  withCacheKeys,
  withLocalKeys,
  withSelectOptionBlur,
  withProps(({ models, modelCount, localOptions }) => ({
    options: localOptions.concat(models),
    optionCount: modelCount + localOptions.size,
  })),
);

const CacheKeysAutoComplete = ({
  selectedOption,
  searchString,
  setSearchString,
  options,
  optionCount,
  fetchMore,
  useTooltip,
  selectOptionBlur
}) => (
  <AutoComplete2
    renderInput={({ hasFocus, onFocus }) => (
      <SingleInput
        hasFocus={hasFocus}
        onFocus={onFocus}
        searchString={searchString}
        parseOption={option => option.get('searchString')}
        renderOption={renderOption({ useTooltip, onFocus })}
        onChangeSearchString={e => setSearchString(e.target.value)}
        selectedOption={selectedOption} />
      )}
    renderOptions={({ onBlur }) => (
      <OptionList
        options={options.entrySeq().toList()}
        optionCount={optionCount}
        renderOption={renderOption({ useTooltip })}
        onSelectOption={selectOptionBlur(onBlur)}
        fetchMore={fetchMore} />
      )} />
  );

export default withKeys(CacheKeysAutoComplete);
