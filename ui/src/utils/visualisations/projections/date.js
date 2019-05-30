import formatDate from 'ui/utils/visualisations/helpers/formatDate';

/**
 * Build "date" expression used in projection stage
 *
 * @param {string} groupType
 * @param {string} timezone
 * @returns object|string
 */
export default (groupType, timezone) => {
  switch (groupType) {
    case 'minute': return formatDate('%Y-%m-%dT%H-%M', timezone);
    case 'hour': return formatDate('%Y-%m-%dT%H', timezone);
    case 'weekday': return formatDate('%Y-%m-%d', timezone);
    case 'month': return formatDate('%Y-%m', timezone);
    default: return 'PROBLEM IN DATE PROJECTION';
  }
};
