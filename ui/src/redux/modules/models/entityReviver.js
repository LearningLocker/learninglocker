import { fromJS, Map } from 'immutable';
import * as schemas from 'ui/utils/schemas';

/*
 *  Reviver function for normalized body result
 */
const entityReviver = (result) => {
  const entitiesMap = new Map(result.entities);
  const entities = entitiesMap.map((value, key) => fromJS(value, schemas[key].reviver));
  return entities;
};

export default entityReviver;
