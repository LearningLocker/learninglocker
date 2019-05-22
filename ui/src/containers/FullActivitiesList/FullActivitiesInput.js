import React from 'react';
import SingleInput from 'ui/components/AutoComplete2/Inputs/SingleInput/SingleInput';
import OptionListItem from 'ui/components/OptionListItem';
import { compose, withProps, defaultProps } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import { fromJS, Map } from 'immutable';
import languageResolver from 'ui/utils/languageResolver';

const renderOption = ({
  useTooltip = false,
  onFocus = () => {},
  models
}) => ({
  option = new Map(),
  onSelectOption = () => {}
}) => {
  const out = (
    <OptionListItem
      data={option}
      label={models.first() ? languageResolver(models.first().get('name', new Map())) : option}
      tooltip={useTooltip ? option : null}
      onClick={(event) => {
        onFocus(event);
        onSelectOption(event);
      }} />
  );
  return out;
};

const withOnChangeSearchString = withProps(({
  onChangeFilter,
  searchStringToFilter
}) => ({
  onChangeSearchString: (e) => {
    const searchString = e.target.value;
    const filter = searchStringToFilter(searchString);
    onChangeFilter(filter);
  }
}));

const defaultSearchStringToFilter = (searchString) => {
  switch (searchString) {
    case '': return new Map();
    default: return fromJS({ searchString: { $regex: searchString, $options: 'i' }})
  }
};
const withSearchStringToFilter = defaultProps({
  searchStringToFilter: defaultSearchStringToFilter
});

export default compose(
  withProps(({
    selectedOption,
  }) => ({
    first: 1,
    schema: 'fullActivities',
    filter: fromJS({
      activityId: selectedOption
    }),
  })),
  withSearchStringToFilter,
  withOnChangeSearchString,
  withModels,
  withProps(({
    onFocus,
    models
  }) => ({
    renderOption: renderOption({
      useTooltip: true,
      onFocus,
      models
    })
  }))
)(SingleInput);
