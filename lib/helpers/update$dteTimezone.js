import moment from 'moment-timezone';
import { List, Map, OrderedMap, Set, fromJS } from 'immutable';
import { UTC_BASED_ZONE_LABELS_MAP } from 'lib/constants/timezones';

/**
 * @param {string} yyyymmddhhmm
 * @param {string} timezone - TZ database name (e.g. "Europe/Paris") or offset (e.g. '+03:00') in UTC_BASED_ZONE_LABELS_MAP
 * @return {string} Z (e.g. "-08:00")
 */
const toZ = (yyyymmddhhmm, timezone) => {
  if (UTC_BASED_ZONE_LABELS_MAP.has(timezone) && timezone !== 'UTC') {
    return timezone;
  }
  return moment(yyyymmddhhmm).tz(timezone).format('Z');
};

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
 * @param {string} timezone - TZ database name (e.g. "Europe/Paris") or offset (e.g. '+03:00') in UTC_BASED_ZONE_LABELS_MAP
 * @returns {any}
 */
export const update$dteTimezone = (query, timezone) => {
  // if query has mapEntries()
  if (Map.isMap(query) || OrderedMap.isOrderedMap(query)) {
    return query.mapEntries(([k, v]) => {
      if (k === '$dte' && typeof v === 'string') {
        // Ignore offset in $dte sub query
        const yyyymmddhhmm = moment.parseZone(v).format('YYYY-MM-DDTHH:mm');
        const z = toZ(yyyymmddhhmm, timezone);

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

/**
 * String -> JSON -> Immutable -> {update} -> Immutable -> JSON -> String
 *
 * @param {string|undefined|null} queryString
 * @param {string} timezone - TZ database name e.g. "Europe/Paris"
 * @returns {string|undefined|null}
 */
export const update$dteTimezoneString = (queryString, timezone) => {
  // Do nothing, if queryString is undefined or null
  if (!queryString) {
    return queryString;
  }
  const query = fromJS(JSON.parse(queryString));
  const updated = update$dteTimezone(query, timezone);
  return JSON.stringify(updated.toJS());
};
