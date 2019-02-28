import { List, Map, OrderedMap, Set } from 'immutable';

/**
 * whether a query has key "$dte"
  *
 * @param {any} query
 * @returns {boolean}
 */
const has$dte = (query) => {
  if (Map.isMap(query) || OrderedMap.isOrderedMap(query)) {
    return query.has('$dte') || query.some(subQuery => has$dte(subQuery));
  }

  if (List.isList(query) || Set.isSet(query)) {
    return query.some(subQuery => has$dte(subQuery));
  }

  return false;
};

export default has$dte;
