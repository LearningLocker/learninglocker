import React from 'react';
import ModelOptionList from 'ui/components/AutoComplete2/Options/ModelOptionList/ModelOptionList';
import AutoComplete2 from 'ui/components/AutoComplete2';
import { compose, withState, withProps, shouldUpdate } from 'recompose';
import { Map, List, fromJS } from 'immutable';
import { connect } from 'react-redux';
import { addTokenToQuery, getCriteria, changeCriteria } from 'ui/utils/queries';
import { valueToCriteria } from 'ui/redux/modules/queryBuilder';
import { modelsSchemaIdSelector } from 'ui/redux/selectors';
import { createSelector } from 'reselect';
import { withModels } from 'ui/utils/hocs';
import shallowEqualObjects from 'shallow-equal/objects';
import { displayLangMap } from 'ui/utils/xapi';
import FullActivitiesInput from './FullActivitiesInput';

const fullActivitiesList = ({
  selectedOption,
  setSearchString,
  setSearchFilter,
  valuesFilter,
  model,
  models, // remove currently selected model
  updateVisualisationModel,
}) => {
  const onSelectOption = ({
    onBlur,
  }) => (e) => {
    let deselectedFilters = model.get('filters');
    if (models.size > 0) {
      // remove these models from the query builder.
      deselectedFilters = model.get('filters').map((filter) => {
        const criteria = getCriteria(filter);

        const objectCriteriaToDelete =
          criteria.filter(
            (value, key) =>
              key.get('criteriaPath').equals(new List(['statement', 'object'])) &&
              value.get('$in', new List()).includes(models.first().get('activityId'))
          );
        const out = changeCriteria(objectCriteriaToDelete);
        return out;
      });
    }

    const newFilters = deselectedFilters.map((match) => {
      const query = match.get('$match', new Map());

      const keyPath = ['statement', 'object'];
      const tokenQuery = valueToCriteria(
        [...keyPath, 'id'].join('.'),
        e.get('activityId')
      );

      const result = addTokenToQuery(query, new List(keyPath), tokenQuery);

      const out = match.set('$match', result);
      return out;
    });

    updateVisualisationModel({
      schema: 'visualisation',
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
              searchString={valuesFilter.getIn(['searchString', '$regex'])}
              parseOption={option => option}
              onChangeSearchString={e => setSearchString(e.target.value)}
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
              parseOption={option => (option ? displayLangMap(option.get('name', new Map())) : '')}
              parseOptionTooltip={option => (option ? option.get('activityId') : '')}
              schema={'fullActivities'}
              canEdit={() => false}
              canAdd={() => false} />
          );
          return ou;
        }} />
    </div>
  );

  return out;
};

const objectIdsSelector = (schema, id) => createSelector(
  [modelsSchemaIdSelector(schema, id)],
  (model) => {
    const filters = model.get('filters', new Map());
    const objectIds = filters.map((filter) => {
      const criteria = getCriteria(filter);

      const objectCriteria =
        criteria.filter(
          (value, key) => key.get('criteriaPath').equals(new List(['statement', 'object']))
        );

      return objectCriteria.toList()
        .flatMap(object => object.getIn(['statement.object.id', '$in'])).toSet();
    });

    if (objectIds.size > 1) {
      const out = objectIds.first().intersect(...objectIds.rest());
      return out.toList();
    }
    if (objectIds.size === 0) {
      return new List();
    }
    return objectIds.first().toList();
  }
);

export default compose(

  withState('searchFilter', 'setSearchFilter'),
  withProps(({
    filter = new Map(),
    searchFilter = new Map(),
    notValuesFilter,
    updateModel
  }) => {
    filter = new Map();
    const out = ({
      fullActivitiesFilter: filter.mergeDeep(searchFilter).mergeDeep(notValuesFilter),
      updateVisualisationModel: updateModel
    });
    return out;
  }),
  withProps(({ fullActivitiesFilter }) => {
    const out = {
      valuesFilter: fullActivitiesFilter
    };
    return out;
  }),
  connect((state, { model }) => {
    const out = {
      objectIds: objectIdsSelector('visualisation', model.get('_id'))(state),
    };
    return out;
  }, { }),
  withProps(({ objectIds }) => {
    const out = {
      schema: 'fullActivities',
      first: 1,
      filter: fromJS({
        activityId: {
          $in: objectIds.toJS()
        }
      }),
    };
    return out;
  }),
  withModels,
  withProps(({ models }) => {
    const firstModel = models.first() || new Map();
    return {
      selectedOption: firstModel.get('activityId')
    };
  }),
  shouldUpdate((
    { objectIds, ...props },
    { objectIds: nextObjectIds, ...nextProps }
  ) => {
    const out = !(
      objectIds.equals(nextObjectIds)
      && shallowEqualObjects(
        props,
        nextProps, ['shouldFetch', 'isLoading']
      )
    );
    return out;
  }),
)(fullActivitiesList);
