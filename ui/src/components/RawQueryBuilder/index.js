import React from 'react';
import { Map, List } from 'immutable';
import JsonTextArea from 'ui/components/JsonTextArea';

const reduceListsToSets = (value) => {
  if (Map.isMap(value)) return value.map(v => reduceListsToSets(v));
  if (List.isList(value)) return value.map(v => reduceListsToSets(v)).toSet();
  return value;
};

const onChangeRaw = onQueryChange => newValue =>
  onQueryChange(reduceListsToSets(newValue));

export default ({ query = new Map(), onQueryChange = () => null }) => (
  <JsonTextArea
    value={query}
    onChange={onChangeRaw(onQueryChange)} />
);
