import React from 'react';
import { Map, toJS, List } from 'immutable';
import { compose, withProps, withState, withHandlers } from 'recompose';
import { withSchema } from 'ui/utils/hocs';
import AutoComplete2 from 'ui/components/AutoComplete2';
import OptionListItem from 'ui/components/OptionListItem';
import OptionList from 'ui/components/AutoComplete2/Options/OptionList/OptionList';
import SingleInput from 'ui/components/AutoComplete2/Inputs/SingleInput/SingleInput';
import { ajaxGetJSON } from 'rxjs/observable/dom/AjaxObservable';

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
  // withProps(({ filter = new Map() }) => ({
  //   filter: filter.merge(new Map({
  //     first: 50,
  //     //sort: { activityId: -1, _id: 1},
  //   }))
  // })),
  // withSchema('querybuildercache'),
  // withProps(({ models }) => ({
  //   models: models.mapKeys((k, model) => model.get('searchString')).map(model =>
  //     model.set('optionKey', model.get('searchString'))
  //   )
  // }))
);

const withCourses = compose(
  withSchema('fullActivities'),
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
  withCourses,
  // withLocalKeys,
  withSelectOptionBlur,
  withProps(({ models, modelCount }) => ({
    options: models,
    optionCount: modelCount,
  })),
);

const unwrap = options => new List(Object.values(options.toJS()).map(e => e.name['en-GB']));

// Options comes through here
const CacheKeysAutoComplete = ({
  selectedOption,
  searchString,
  setSearchString,
  options,
  optionCount,
  fetchMore,
  useTooltip,
  selectOptionBlur,
}) => {
  return (
    <div>
  <AutoComplete2
    renderInput={({ hasFocus, onFocus }) => (
      <SingleInput
        hasFocus={hasFocus}
        onFocus={onFocus}
        searchString={searchString}
        parseOption={option => {
          console.log('the option is ', option)
          return option
        }}
        renderOption={renderOption({ useTooltip, onFocus })}
        onChangeSearchString={e => setSearchString(e.target.value)}
        selectedOption={selectedOption} />
      )}
    renderOptions={({ onBlur }) => {
      return (
      <OptionList
        options={unwrap(options)}
        //options={new List(['test','blah'])}
        optionCount={optionCount}
        renderOption={renderOption({ useTooltip })}
        onSelectOption={selectOptionBlur(onBlur)}
        fetchMore={fetchMore} />
      )}
      } />
      </div>
  )
    
};

export default withKeys(CacheKeysAutoComplete);
