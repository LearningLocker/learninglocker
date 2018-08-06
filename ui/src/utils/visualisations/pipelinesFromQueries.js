import { Map, List } from 'immutable';
import moment from 'moment';
import pipelineFromQuery from './pipelineFromQuery';

export default (
  queries,
  axes,
  type,
  previewPeriod,
  id,
  benchmarkingEnabled = false,
  today = moment().utc().startOf('day')
) => {
  if (benchmarkingEnabled) {
    const out = queries.map(query =>
      new List([
        pipelineFromQuery(new Map({
          query, axes, type, previewPeriod, id, today
        })),
        pipelineFromQuery(new Map({
          query, axes, type, previewPeriod, id, today, benchmarkingEnabled
        }))
      ])
    ).flatten(1);
    return out;
  }

  return queries.map(query => pipelineFromQuery(new Map({
    query, axes, type, previewPeriod, id, today
  })));
};
