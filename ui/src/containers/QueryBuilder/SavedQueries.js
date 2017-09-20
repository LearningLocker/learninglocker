import React, { PropTypes } from 'react';
import { compose, setPropTypes, withState, withProps, withHandlers } from 'recompose';
import { Map, fromJS, Iterable } from 'immutable';
import isString from 'lodash/isString';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import ModelAutoComplete from 'ui/containers/ModelAutoComplete';
import { mergeQueries, queryToString } from 'ui/utils/queries';
import { withModel } from 'ui/utils/hocs';
import styles from './savedqueries.css'; // 'ui/containers/QueryBuilder/savedqueries.css' doesn't work in testing on import

const getConditions = (query) => {
  if (!query) return new Map();
  const conditions = query && query.get('conditions', new Map());

  try {
    if (isString(conditions)) return fromJS(JSON.parse(conditions));
  } catch (err) {
    return new Map();
  }

  return Iterable.isIterable(conditions)
    ? conditions
    : fromJS(conditions);
};

const searchStringToFilter = (searchString) => {
  switch (searchString) {
    case '': return new Map();
    default: return fromJS({ name: { $regex: searchString, $options: 'i' } });
  }
};
const parseOption = option => (option ? option.get('name') : '');
const parseOptionTooltip = option => (option
  ? queryToString(option.get('conditions'))
  : ''
);

const withSelectedQuery = compose(
  withState('selectedQueryId', 'setSelectedQueryId'),
  withHandlers({
    setSelectedQuery: ({ setSelectedQueryId }) => (model) => {
      const modelId = model ? model.get('_id') : null;
      setSelectedQueryId(modelId);
    }
  }),
  withProps(({ selectedQueryId }) => ({
    id: selectedQueryId,
    schema: 'query'
  })),
  withModel,
  withProps(({ model }) => ({ selectedQuery: model }))
);

const enhance = compose(
  withStyles(styles),
  setPropTypes({
    onQueryChange: PropTypes.func,
    query: PropTypes.instanceOf(Map)
  }),
  withSelectedQuery,
  withHandlers({
    updateSelectedQuery: ({ query, updateModel }) => (e) => {
      e.preventDefault();
      updateModel({ path: ['conditions'], value: query });
    },
    applySelectedQuery: ({ selectedQuery, onQueryChange }) => (e) => {
      e.preventDefault();
      onQueryChange(selectedQuery.get('conditions'));
    },
    mergeSelectedQuery: ({ selectedQuery, query, onQueryChange }) => (e) => {
      e.preventDefault();
      onQueryChange(mergeQueries(query, selectedQuery.get('conditions')));
    }
  }),
);

const savedQueries = ({
  selectedQuery,
  query,
  updateSelectedQuery,
  applySelectedQuery,
  mergeSelectedQuery,
  setSelectedQuery
}) => {
  const conditions = getConditions(selectedQuery);
  const queriesEqual = conditions.equals(query);
  const queriesEqualMessage = 'Saved and active queries are the same!';
  const isQueryEmpty = selectedQuery.isEmpty();
  return (
    <div style={{ marginBottom: '16px', display: 'flex' }} className="queryButtons">
      <ModelAutoComplete
        schema="query"
        placeholder="Select a saved query"
        values={selectedQuery}
        onChange={setSelectedQuery}
        searchStringToFilter={searchStringToFilter}
        parseOption={parseOption}
        parseOptionTooltip={parseOptionTooltip}
        defaultNewValues={{ conditions: query }} />
      <div className={styles.buttonContainer}>
        <button
          disabled={isQueryEmpty || queriesEqual}
          className="btn btn-default btn-sm"
          onClick={updateSelectedQuery}
          title={queriesEqual ? queriesEqualMessage : 'Update saved query'}>
          <i className="glyphicon glyphicon-floppy-disk" />
        </button>
        <button
          disabled={isQueryEmpty || queriesEqual}
          className="btn btn-default btn-sm"
          onClick={applySelectedQuery}
          title={queriesEqual ? queriesEqualMessage : 'Load saved query'}>
          <i className="glyphicon glyphicon-save" />
        </button>
        <button
          disabled={isQueryEmpty || queriesEqual}
          className="btn btn-default btn-sm"
          onClick={mergeSelectedQuery}
          title={queriesEqual ? queriesEqualMessage : 'Merge saved query'}>
          <i className="glyphicon glyphicon-import" />
        </button>
      </div>
    </div>
  );
};

export default enhance(savedQueries);
