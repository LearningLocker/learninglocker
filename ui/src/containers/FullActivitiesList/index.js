import React from 'react';
import ModelOptionList from 'ui/components/AutoComplete2/Options/ModelOptionList/ModelOptionList';
// import SingleInput from 'ui/components/AutoComplete2/Inputs/SingleInput/SingleInput';
import AutoComplete2 from 'ui/components/AutoComplete2';
import OptionListItem from 'ui/components/OptionListItem';
import languageResolver from 'ui/utils/languageResolver';
import { compose, withState, withProps } from 'recompose';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import { addTokenToQuery } from 'ui/utils/queries';
import { valueToCriteria } from 'ui/redux/modules/queryBuilder';
import { modelsSchemaIdSelector } from 'ui/redux/selectors';
import { createSelector } from 'reselect';
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
  updateModel,
  schema,
}) => {
  // DEBUG ONLY, remove
  selectedOption = 'https://www.lynda.com/CourseID/622074';

  const onSelectOption = ({ onBlur }) => (e) => {
    const newFilters = model.get('filters').map((match) => {
      const query = match.get('$match', new Map());

      const keyPath = ['statement', 'object'];
      const tokenQuery = valueToCriteria(
        [...keyPath, 'id'].join('.'),
        new Map({ value: e.get('activityId') })
      );

      const result = addTokenToQuery(query, new List(keyPath), tokenQuery);

      const out = match.set('$match', result);
      return out;
    });

    updateModel({
      schema,
      id: model.get('_id'),
      path: 'filters',
      value: newFilters
    });

    onBlur();
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
        renderOptions={({ onBlur }) => {
          const ou = (
            <ModelOptionList
              filter={valuesFilter.mergeDeep({ type: 'http://adlnet.gov/expapi/activities/course' })}
              onSelectOption={onSelectOption({ onBlur })}
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

// const courseIdSelector = (schema, id) => createSelector(
//   [modelsSchemaIdSelector(schema, id)],
//   (model) => {
//     const filters = model.get('filters');



//   }
// );

export default compose(
  withState('searchFilter', 'setSearchFilter'),
  withProps(({ filter = new Map(), searchFilter = new Map(), notValuesFilter }) => ({
    filter: filter.mergeDeep(searchFilter).mergeDeep(notValuesFilter),
    schema: 'visualisation'
  })),
  withProps(({ filter }) => {
    return {
      valuesFilter: filter
    };
  }),
  // connect((state, { schema, model }) => {

  //   return {
  //     selectedOption: courseIdSelector(schema, model.get('_id')),
  //   };
  // }, { })
)(fullActivitiesList);
