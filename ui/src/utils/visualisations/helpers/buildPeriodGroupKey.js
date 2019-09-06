/**
 * build a key for unique modifier grouping
 *
 * unique modifier grouping means that grouping operator is {uniqueAverage|uniqueMax|uniqueMin}
 *
 * We can calculate {uniqueAverage|uniqueMax|uniqueMin} of {minute,hour,weekday,month}.
 * When we try to calculate {uniqueAverage|uniqueMax|uniqueMin} of other keys,
 * the results are same with the result of "uniqueCount".
 *
 * @param {string} groupType
 * @param {string} timezone
 * @returns object|string
 */
export default (groupType, timezone) => {
  const expression = {
    date: '$timestamp',
    timezone,
  };

  switch (groupType) {
    case 'minute': return { $minute: expression };
    case 'hour': return { $hour: expression };
    case 'weekday': return { $dayOfWeek: expression };
    case 'month': return { $month: expression };
    default: return 'PROBLEM IN PERIOD PROJECTION';
  }
};
