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
  PIE,
} from 'ui/utils/constants';

export default memoize((args = new Map()) => {
  const query = args.getIn(['query', '$match'], new Map());
  const previewPeriod = args.get('previewPeriod');
  const today = args.get('today');
  const queryMatch = query.size === 0 ? [] : [{ $match: query }];
  const previewPeriodMatch = [{ $match: {
    timestamp: { $gte: { $dte: periodToDate(previewPeriod, today).toISOString() } }
  } }];
  const type = args.get('type');
  const axes = args.get('axes');
  const preReqs = fromJS(previewPeriodMatch.concat(queryMatch));
  switch (type) {
    case POPULARACTIVITIES:
    case LEADERBOARD:
    case PIE:
    case STATEMENTS:
    case FREQUENCY:
      return aggregateChart(preReqs, axes);
    case XVSY:
      return aggregateXvsY(preReqs, axes);
    case COUNTER:
      return aggregateCounter(preReqs, axes);
    default:
      return query;
  }
}, iterable => iterable.toJS());
