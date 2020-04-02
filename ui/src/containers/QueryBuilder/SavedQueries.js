import React from 'react';
import PropTypes from 'prop-types';
import { compose, setPropTypes, withState, withProps, withHandlers } from 'recompose';
import { Map, fromJS, Iterable } from 'immutable';
import styled from 'styled-components';
import isString from 'lodash/isString';
import ModelAutoComplete from 'ui/containers/ModelAutoComplete';
import { queryToStringList } from 'ui/utils/queries';
import { withModel } from 'ui/utils/hocs';
import { ButtonContainer } from 'ui/containers/QueryBuilder/styled';

const QueryButtons = styled.div`
  margin-bottom: 16px;
  display: flex;
`;

const getConditions = (query) => {
  if (!query) return new Map();
  const conditions = query.get('conditions', new Map());

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
const parseOptionTooltip = (option) => {
  if (!option) {
    return '';
  }
  const stringList = queryToStringList(option.get('conditions'));
  return (
    <div>
      {
        stringList.map((item, i) => (
          <div key={i}>{item}</div>
        ))
      }
    </div>
  );
};

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
  }),
);

const SavedQueries = ({
  selectedQuery,
  query,
  updateSelectedQuery,
  applySelectedQuery,
  setSelectedQuery,
}) => {
  const conditions = getConditions(selectedQuery);
  const queriesEqual = conditions.equals(query);
  const queriesEqualMessage = 'Saved and active queries are the same!';
  const isQueryEmpty = selectedQuery.isEmpty();
  return (
    <QueryButtons>
      <ModelAutoComplete
        schema="query"
        placeholder="Select a saved query"
        values={selectedQuery}
        onChange={setSelectedQuery}
        searchStringToFilter={searchStringToFilter}
        parseOption={parseOption}
        parseOptionTooltip={parseOptionTooltip}
        defaultNewValues={{ conditions: query }} />
      <ButtonContainer>
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
      </ButtonContainer>
    </QueryButtons>
  );
};

export default enhance(SavedQueries);
