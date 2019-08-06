import { Map, fromJS } from 'immutable';
import { memoize } from 'lodash';
import {
  LEADERBOARD,
  XVSY,
  STATEMENTS,
  FREQUENCY,
  COUNTER,
  PIE,
  TEMPLATE_ACTIVITY_OVER_TIME,
  TEMPLATE_LAST_7_DAYS_STATEMENTS,
  TEMPLATE_MOST_ACTIVE_PEOPLE,
  TEMPLATE_MOST_POPULAR_ACTIVITIES,
  TEMPLATE_MOST_POPULAR_VERBS,
  TEMPLATE_WEEKDAYS_ACTIVITY,
} from 'lib/constants/visualise';
import { update$dteTimezone } from 'lib/helpers/update$dteTimezone';
import { periodToDate } from 'ui/utils/dates';
import aggregateChart from 'ui/utils/visualisations/aggregateChart';
import aggregateCounter from 'ui/utils/visualisations/aggregateCounter';
import aggregateXvsY from 'ui/utils/visualisations/aggregateXvsY';

/**
 * build pipeline from query
 *
 * @param {immutable.Map} args - optional (default is empty Map)
 */
export default memoize((args = new Map()) => {
  const previewPeriod = args.get('previewPeriod');
  const timezone = args.get('timezone');
  const currentMoment = args.get('currentMoment');

  let previewPeriodMatch = [{ $match: {
    timestamp: { $gte: { $dte: periodToDate(previewPeriod, timezone, currentMoment).toISOString() } }
  } }];

  if (args.get('benchmarkingEnabled')) {
    const previousStartDate = periodToDate(previewPeriod, timezone, currentMoment, 2).toISOString();
    previewPeriodMatch = [{ $match: {
      timestamp: { $gte: { $dte: previousStartDate }, $lte: { $dte: periodToDate(previewPeriod, timezone, currentMoment).toISOString() } }
    } }];
  }

  const query = args.getIn(['query', '$match'], new Map());
  // Set timezone of When filters (timestamp and stored)
  const offsetFixedQuery = update$dteTimezone(query, timezone);
  const queryMatch = offsetFixedQuery.size === 0 ? [] : [{ $match: offsetFixedQuery }];

  const preReqs = fromJS(previewPeriodMatch.concat(queryMatch));

  const type = args.get('type');
  const axes = args.get('axes');

  switch (type) {
    case LEADERBOARD:
    case PIE:
    case STATEMENTS:
    case FREQUENCY:
    case TEMPLATE_ACTIVITY_OVER_TIME:
    case TEMPLATE_MOST_ACTIVE_PEOPLE:
    case TEMPLATE_MOST_POPULAR_ACTIVITIES:
    case TEMPLATE_MOST_POPULAR_VERBS:
    case TEMPLATE_WEEKDAYS_ACTIVITY:
      return aggregateChart(preReqs, axes, timezone);
    case XVSY:
      return aggregateXvsY(preReqs, axes, timezone);
    case COUNTER:
    case TEMPLATE_LAST_7_DAYS_STATEMENTS:
      return aggregateCounter(preReqs, axes, timezone);
    default:
      return query;
  }
}, iterable => iterable.toJS());
