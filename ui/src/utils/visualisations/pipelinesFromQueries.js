import { Map } from 'immutable';
import moment from 'moment';
import pipelineFromQuery from './pipelineFromQuery';

export default (
  queries,
  axes,
  type,
  previewPeriod,
  id,
  today = moment().utc().startOf('day')
) => queries.map(query => pipelineFromQuery(new Map({
  query, axes, type, previewPeriod, id, today
})));
