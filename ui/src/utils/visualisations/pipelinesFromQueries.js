import { Map, List } from 'immutable';
import moment from 'moment';
import pipelineFromQuery from './pipelineFromQuery';

/**
 * build pipelines from queries
 *
 * @param {immutable.List} queries
 * @param {immutable.Map} axes
 * @param {string} type - VISUALISATION_TYPES
 * @param {string} previewPeriod - See ui/src/utils/constants.js
 * @param {*} id
 * @param {string} timezone
 * @param {boolean} benchmarkingEnabled - optional
 * @param {Moment} today - optional
 * @returns immutable.List
 */
export default (
  queries,
  axes,
  type,
  previewPeriod,
  id,
  timezone,
  benchmarkingEnabled = false,
  today = moment().utc().startOf('day')
) => {
  if (benchmarkingEnabled) {
    const out = queries.map(query =>
      new List([
        pipelineFromQuery(new Map({
          query, axes, type, previewPeriod, id, timezone, today
        })),
        pipelineFromQuery(new Map({
          query, axes, type, previewPeriod, id, timezone, today, benchmarkingEnabled
        }))
      ])
    ).flatten(1);

    return out;
  }

  return queries.map(query => pipelineFromQuery(new Map({
    query, axes, type, previewPeriod, id, timezone, today
  })));
};
