import { Map, fromJS } from 'immutable';
import { TEMPLATE_STREAM_ACTIVITIES_WITH_MOST_COMMENTS } from 'lib/constants/visualise';
import { LAST_7_DAYS } from 'ui/utils/constants';
import { description } from './constants';

const filter = fromJS({
  $match: {
    $and: [
      {
        $comment: '{"criterionLabel":"A","criteriaPath":["statement","verb"]}',
        'statement.verb.id': {
          $in: [
            'http://adlnet.gov/expapi/verbs/commented',
          ],
        },
      },
      {
        $comment: '{"criterionLabel":"B","criteriaPath":["statement","context","platform"]}',
        'statement.context.platform': {
          $in: [
            'Stream',
            'Curatr'
          ],
        },
      },
    ],
  },
});

/**
 * @param {immutable.Map} model
 * @returns {immutable.Map}
 */
const buildModel = model =>
  model
    .set('type', TEMPLATE_STREAM_ACTIVITIES_WITH_MOST_COMMENTS)
    .set('description', description)
    .set('filters', [filter])
    .set('axesgroup', new Map({ optionKey: 'activities', searchString: 'Activity' }))
    .set('axesoperator', 'uniqueCount')
    .set('axesvalue', new Map({ optionKey: 'statements', searchString: 'Statements' }))
    .set('axesxLabel', 'Count')
    .set('axesyLabel', 'Activity name')
    .set('sourceView', true)
    .set('previewPeriod', LAST_7_DAYS);

export default buildModel;
