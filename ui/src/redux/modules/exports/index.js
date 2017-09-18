
import { Map, fromJS } from 'immutable';
import { handleActions } from 'redux-actions';
import * as downloadExportDuck from 'ui/redux/modules/exports/downloadExport';
// import { saveAs } from 'node-safe-filesaver';
// import uuid from 'uuid';

/*
 * Reducers
 */
const handler = handleActions({
  ...downloadExportDuck.reducers,
});

const initialState = new Map();
export default function reducer(state = initialState, action = {}) {
  if (!Map.isMap(state)) return reducer(fromJS(state), action); // ensure immutability
  return handler(state, action);
}


/*
 * Actions
 */
export const downloadExport = downloadExportDuck.actions.start;

export const getDefaultProjectionFromType = (type) => {
  if (type) {
    return new Map({
      _id: 1,
      version: '$statement.version',
      id: '$statement.id',
      timestamp: '$statement.timestamp',
      stored: '$statement.stored',
      actor: '$statement.actor',
      verb: '$statement.verb',
      object: '$statement.object',
      result: '$statement.result',
      authority: '$statement.authority',
      context: '$statement.context',
    });
  }
};


/*
* Sagas
*/

export const sagas = [...downloadExportDuck.sagas];
