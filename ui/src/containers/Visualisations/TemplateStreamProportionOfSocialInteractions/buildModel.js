import { Map, fromJS } from 'immutable';
import { TEMPLATE_STREAM_PROPORTION_OF_SOCIAL_INTERACTIONS } from 'lib/constants/visualise';
import { LAST_7_DAYS } from 'ui/utils/constants';
import { description } from './constants';

/**
 * @param {string} label
 * @param {string[]} verbIds
 * @returns {immutable.Map} filter
 */
const filters = [fromJS({
  $match: {
    $and: [
      {
        $comment: '{"criterionLabel":"A","criteriaPath":["statement","verb"]}',
        'statement.verb.id': {
          $in: [
            'http://adlnet.gov/expapi/verbs/commented',
            'http://curatr3.com/define/verb/voted-up',
            'http://adlnet.gov/expapi/verbs/shared',
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
})];

/**
 * @param {immutable.Map} model
 * @returns {immutable.Map}
 */
const buildModel = model =>
  model
    .set('type', TEMPLATE_STREAM_PROPORTION_OF_SOCIAL_INTERACTIONS)
    .set('description', description)
    .set('axesgroup', new Map({ optionKey: 'verb', searchString: 'Verb' }))
    .set('axesoperator', 'uniqueCount')
    .set('axesvalue', new Map({ optionKey: 'statements', searchString: 'Statements' }))
    .set('isDonut', true)
    .set('filters', filters)
    .set('previewPeriod', LAST_7_DAYS);

export default buildModel;
