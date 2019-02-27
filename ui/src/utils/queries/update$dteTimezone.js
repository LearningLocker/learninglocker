import moment from 'moment-timezone';
import { List, Map, OrderedMap, Set } from 'immutable';

/**
 * Change $dte timezone offset
 *
 * e.g.
 * const query1 = immutable.fromJS({ $and: { $dte: '2019-12-31T00:00-11:00' } });
 * const query2 = immutable.fromJS({ $and: { $dte: '2019-12-31T00:00+09:00' } });
 * const timezone = 'Asia/Tokyo'; // +09:00
 * const updated = update$dteTimezone(query1, timezone);
 * updated.equals(query2); // true
 *
 * @param {any} query
 * @param {string} timezone - TZ database name e.g. "Europe/Paris"
 * @returns {any}
 */
const update$dteTimezone = (query, timezone) => {
  // if query has mapEntries()
  if (Map.isMap(query) || OrderedMap.isOrderedMap(query)) {
    return query.mapEntries(([k, v]) => {
      if (k === '$dte' && typeof v === 'string') {
        // Ignore offset in $dte sub query
        const yyyymmddhhmm = moment.parseZone(v).format('YYYY-MM-DDTHH:mm');
        const z = moment(yyyymmddhhmm).tz(timezone).format('Z');
        // Apply timezone offset
        return [k, `${yyyymmddhhmm}${z}`];
      }
      return [k, update$dteTimezone(v, timezone)];
    });
  }

  // if query does not have mapEntries() but it has map()
  if (List.isList(query) || Set.isSet(query)) {
    return query.map(v => update$dteTimezone(v, timezone));
  }

  return query;
};

export default update$dteTimezone;
