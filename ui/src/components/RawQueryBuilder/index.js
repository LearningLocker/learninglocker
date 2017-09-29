import React from 'react';
import { Map, List } from 'immutable';
import JsonTextArea from 'ui/components/JsonTextArea';
import { compose, withState } from 'recompose';

const textAreaState = withState(
  'textAreaValue',
  'setTextAreaValue',
  ({ query = new Map() }) => query
);


const reduceListsToSets = (value) => {
  if (Map.isMap(value)) return value.map(v => reduceListsToSets(v));
  if (List.isList(value)) return value.map(v => reduceListsToSets(v)).toSet();
  return value;
};

const onChangeRaw = onQueryChange => newValue => () => {
  onQueryChange(reduceListsToSets(newValue));
};

const rawQueryBuilder = ({
  onQueryChange = () => null,
  textAreaValue,
  setTextAreaValue
}) => (
  <div className="clearfix">
    <JsonTextArea
      value={textAreaValue}
      onChange={setTextAreaValue} />
    <button
      className="btn btn-primary btn-sm pull-right"
      onClick={onChangeRaw(onQueryChange)(textAreaValue)}>Submit</button>
  </div>
);

export default compose(
  textAreaState
)(rawQueryBuilder);
