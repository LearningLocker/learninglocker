import { createSelector } from 'reselect';
import { Iterable } from 'immutable';

export const clientIdsSelector = state => state.clientIds;

const actualIdFromClientIds = (clientIds, id) => clientIds.get(id, id);

export const idSelector = id => createSelector(
  [clientIdsSelector],
  (clientIds) => {
    // check if the id is an iterable or a single item
    if (Iterable.isIterable(id)) {
      return id.map(actualIdFromClientIds.bind(null, clientIds));
    }
    return actualIdFromClientIds(clientIds, id);
  }
);
