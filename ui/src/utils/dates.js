import moment from 'moment-timezone';
import { toTimezone } from 'lib/constants/timezones';
import {
  LAST_30_DAYS,
  LAST_7_DAYS,
  LAST_2_MONTHS,
  LAST_6_MONTHS,
  LAST_24_HOURS,
  LAST_1_YEAR,
  LAST_2_YEARS,
  TODAY
} from 'ui/utils/constants';

/**
 *
 * @param {string} period - LAST_* or TODAY in ui/utils/constants
 * @param {string} timezone - TZ database name (e.g. "Europe/Paris") or offset (e.g. '+03:00') in UTC_BASED_ZONE_LABELS_MAP
 * @param {Moment} currentMoment - Moment object
 * @param {number} benchmark
 * @returns {Moment} - Moment object in UTC
 */
export const periodToDate = (period, timezone, currentMoment, benchmark = 1) => {
  const cloned = moment(currentMoment).utc();

  switch (period) {
    case TODAY: return cloned.tz(toTimezone(timezone)).startOf('day').utc();
    case LAST_24_HOURS: return cloned.subtract(24 * benchmark, 'hours');
    case LAST_7_DAYS: return cloned.subtract(7 * benchmark, 'days');
    case LAST_30_DAYS: return cloned.subtract(30 * benchmark, 'days');
    case LAST_2_MONTHS: return cloned.subtract(2 * benchmark, 'months');
    case LAST_6_MONTHS: return cloned.subtract(6 * benchmark, 'months');
    case LAST_1_YEAR: return cloned.subtract(1 * benchmark, 'years');
    case LAST_2_YEARS: return cloned.subtract(2 * benchmark, 'years');
    default: return cloned.subtract(7 * benchmark, 'days');
  }
};

export default {};
