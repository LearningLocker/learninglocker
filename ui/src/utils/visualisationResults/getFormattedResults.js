import { Map, List, Range } from 'immutable';
import moment from 'moment';

const hourMap = new Range(0, 24).toList();
const weekdayMap = new List(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
const monthMap = new List([
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]);

const seriesFormatter = (results, formatMap, offset = 0) =>
  results.map(series =>
    series.map(entries =>
      formatMap.map((model, _id) =>
        new Map({
          _id,
          count: entries.getIn([_id + offset, 'count'], 0),
          model
        })
      ).toMap().mapKeys(k => k.toString())
    )
  );

const getDateRange = (results) => {
  let minDate = null;
  let maxDate = null;
  results.forEach((series) => {
    series.forEach((entries) => {
      entries.forEach((entry) => {
        const entryDate = moment(entry.get('_id'));
        minDate = minDate ? moment.min(minDate, entryDate) : entryDate;
        maxDate = maxDate ? moment.max(maxDate, entryDate) : entryDate;
      });
    });
  });

  if (!minDate && !maxDate) {
    // we have no data, just return the results without any foramtting
    return results;
  }

  const days = maxDate.diff(minDate, 'days');
  const range = (days === 0) ? new List([0]) : new Range(0, days + 1).toList();

  const dateMap = range
    .map(day => minDate.clone().add(day, 'day').format('YYYY-MM-DD'))
    .toMap()
    .mapKeys((k, v) => v);

  return seriesFormatter(results, dateMap, '');
};

export default (optionKey = 'date', results) => {
  switch (optionKey) {
    case 'hour':
      return seriesFormatter(results, hourMap);
    case 'weekday':
      return seriesFormatter(results, weekdayMap, 1);
    case 'month':
      return seriesFormatter(results, monthMap, 1);
    case 'date': {
      return getDateRange(results);
    }
    default:
      return results;
  }
};
