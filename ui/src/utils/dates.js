import {
  LAST_30_DAYS,
  LAST_7_DAYS,
  LAST_2_MONTHS,
  LAST_6_MONTHS,
  LAST_24_HOURS,
  LAST_1_YEAR,
  LAST_2_YEARS
} from 'ui/utils/constants';
import moment from 'moment';

export const periodToDate = (datePeriod, today, benchmark = 1 ) => {
  const today2 = moment(today); // Clones the date so it's not mutated.
  switch (datePeriod) {
    case LAST_24_HOURS: return today2.subtract(24 * benchmark, 'hours');
    case LAST_7_DAYS: default: return today2.subtract(7 * benchmark, 'days');
    case LAST_30_DAYS: return today2.subtract(30 * benchmark, 'days');
    case LAST_2_MONTHS: return today2.subtract(2 * benchmark, 'months');
    case LAST_6_MONTHS: return today2.subtract(6 * benchmark, 'months');
    case LAST_1_YEAR: return today2.subtract(1 * benchmark, 'years');
    case LAST_2_YEARS: return today2.subtract(2 * benchmark, 'years');
  }
};

export default (...args) => ({ periodToDate: periodToDate(...args).toISOString() });
