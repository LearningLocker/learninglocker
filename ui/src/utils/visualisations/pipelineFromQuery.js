import { Map, fromJS } from 'immutable';
import { memoize } from 'lodash';
import { periodToDate } from 'ui/utils/dates';
import aggregateChart from 'ui/utils/visualisations/aggregateChart';
import aggregateCounter from 'ui/utils/visualisations/aggregateCounter';
import aggregateXvsY from 'ui/utils/visualisations/aggregateXvsY';
import {
  POPULARACTIVITIES,
  LEADERBOARD,
  XVSY,
  STATEMENTS,
  FREQUENCY,
  COUNTER,
  PIE
} from 'ui/utils/constants';

/**
 * build pipeline from query
 *
 * @param {immutable.Map} args - optional (default is empty Map)
 */
export default memoize((args = new Map()) => {
  const query = args.getIn(['query', '$match'], new Map());
  const previewPeriod = args.get('previewPeriod');
  const timezone = args.get('timezone');
  const today = args.get('today');
  const queryMatch = query.size === 0 ? [] : [{ $match: query }];
  const previousStartDate = periodToDate(previewPeriod, today, 2).toISOString();

  let previewPeriodMatch = [{ $match: {
    timestamp: { $gte: { $dte: periodToDate(previewPeriod, today).toISOString() } }
  } }];

  if (args.get('benchmarkingEnabled')) {
    previewPeriodMatch = [{ $match: {
      timestamp: { $gte: { $dte: previousStartDate }, $lte: { $dte: periodToDate(previewPeriod, today).toISOString() } }
    } }];
  }

  const type = args.get('type');
  const axes = args.get('axes');
  const preReqs = fromJS(previewPeriodMatch.concat(queryMatch));
  switch (type) {
    case POPULARACTIVITIES:
    case LEADERBOARD:
    case PIE:
    case STATEMENTS:
    case FREQUENCY:
      return aggregateChart(preReqs, axes, timezone);
    case XVSY:
      return aggregateXvsY(preReqs, axes, timezone);
    case COUNTER:
      return aggregateCounter(preReqs, axes, timezone);
    default:
      return query;
  }
}, iterable => iterable.toJS());
