import { Map, fromJS } from 'immutable';
import { TEMPLATE_CURATR_COMMENT_COUNT } from 'lib/constants/visualise';
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
            'Curatr',
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
    .set('type', TEMPLATE_CURATR_COMMENT_COUNT)
    .set('description', description)
    .set('filters', [filter])
    .set('axesoperator', 'uniqueCount')
    .set('axesvalue', new Map({ optionKey: 'statements', searchString: 'Statements' }))
    .set('benchmarkingEnabled', true)
    .set('previewPeriod', LAST_7_DAYS);

export default buildModel;
