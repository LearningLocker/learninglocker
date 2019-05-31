import formatDate from 'ui/utils/visualisations/helpers/formatDate';

export const periodKeys = [
  'date',
  'minute',
  'hour',
  'weekday',
  'month',
  'year',
];

/**
 * returns period expression or undefined
 *
 * @param {string} groupType
 * @param {string} timezone
 * @returns object|undefined
 */
export default (groupType, timezone) => {
  const expression = {
    date: '$timestamp',
    timezone,
  };

  switch (groupType) {
    case 'date': return formatDate('%Y-%m-%d', timezone);
    case 'minute': return { $minute: expression };
    case 'hour': return { $hour: expression };
    case 'weekday': return { $dayOfWeek: expression };
    case 'month': return { $month: expression };
    case 'year': return { $year: expression };
    default: return undefined;
  }
};
