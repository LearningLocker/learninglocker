import React from 'react';
import ModelOptionList from 'ui/components/AutoComplete2/Options/ModelOptionList/ModelOptionList';
// import SingleInput from 'ui/components/AutoComplete2/Inputs/SingleInput/SingleInput';
import AutoComplete2 from 'ui/components/AutoComplete2';
import OptionListItem from 'ui/components/OptionListItem';
import languageResolver from 'ui/utils/languageResolver';
import { compose, withState, withProps } from 'recompose';
import { Map, fromJS } from 'immutable';
import { addCriterionFromSection } from 'ui/utils/queries';
import { withModel } from 'ui/utils/hocs';
import FullActivitiesInput from './FullActivitiesInput';

const renderOption = ({
  useTooltip = false,
  onFocus = () => {},
}) => ({
  option = new Map(),
  onSelectOption = () => {}
}) => {
  // const out = (
  //   <OptionListItem
  //     data={option}
  //     label={option.get('searchString')}
  //     tooltip={useTooltip ? option.get('searchString') : null}
  //     onClick={(event) => {
  //       onFocus(event);
  //       onSelectOption(event);
  //     }} />
  // );
  const out = (
    <OptionListItem
      data={option}
      label={option}
      tooltip={useTooltip ? option : null}
      onClick={(event) => {
        onFocus(event);
        onSelectOption(event);
      }} />
  );
  return out;
};

const fullActivitiesList = ({
  useTooltip,
  selectedOption,
  setSearchString,
  setSearchFilter,
  valuesFilter,
  model,
  updateModel
}) => {
  // DEBUG ONLY, remove
  selectedOption = 'https://www.lynda.com/CourseID/622074';

  const onSelectOption = (e) => {
    const newFilters = model.get('filters').map((match) => {
      const query = match.get('$match');
      const result = addCriterionFromSection(query, fromJS({
        $or: [{
          'statement.object.id': e.get('activityId')
        }]
      }), fromJS({
        keyPath: 'statement.object'
      }));

      return query.set('$match', result);
    });

    updateModel({
      path: 'filters', value: model.get('filters')
    });
    console.log('002 result', newFilters);
  };

  const out = (
    <div>
      <AutoComplete2
        renderInput={({ hasFocus, onFocus }) => {
          const ou = (
            <FullActivitiesInput
              filter={valuesFilter}
              hasFocus={hasFocus}
              hasInputFocus={hasFocus}
              onFocus={onFocus}
              searchString={valuesFilter.getIn(['activityId', '$regex'])}
              parseOption={option => option}
              renderOption={renderOption({ useTooltip, onFocus })}
              onChangeSearchString={(e) => {
                const o = setSearchString(e.target.value);
                return o;
              }}
              placeholder={'Select a Course'}
              selectedOption={selectedOption}
              onChangeFilter={(searchFilter) => {
                setSearchFilter(searchFilter);
              }} />
          );

          return ou;
        }}
        renderOptions={() => {
          const ou = (
            <ModelOptionList
              filter={valuesFilter}
              onSelectOption={onSelectOption}
              parseOption={(option) => {
                const o = (option ? languageResolver(option.get('name', new Map())) : '');
                return o;
              }}
              parseOptionTooltip={option => (option ? option.get('activityId') : '')}
              schema={'fullActivities'}
              canEdit={() => false}
              canAdd={() => false} />
          );
          return ou;
        }}
      />
    </div>
  );

  return out;
};

export default compose(
  withState('searchFilter', 'setSearchFilter'),
  withProps(({ filter = new Map(), searchFilter = new Map(), notValuesFilter }) => ({
    filter: filter.mergeDeep(searchFilter).mergeDeep(notValuesFilter)
  })),
  withProps(({ filter }) => {
    return {
      valuesFilter: filter
    };
  }),
)(fullActivitiesList);
