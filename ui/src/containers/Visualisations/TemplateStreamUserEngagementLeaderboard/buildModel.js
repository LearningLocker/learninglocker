import { Map, fromJS } from 'immutable';
import { TEMPLATE_STREAM_USER_ENGAGEMENT_LEADERBOARD } from 'lib/constants/visualise';
import { LAST_7_DAYS } from 'ui/utils/constants';
import { description } from './constants';

/**
 * @param {string} label
 * @param {string[]} verbIds
 * @returns {immutable.Map} filter
 */
const buildFilter = (label, verbIds) => fromJS({
  label,
  $match: {
    $and: [
      {
        $comment: '{"criterionLabel":"A","criteriaPath":["statement","verb"]}',
        'statement.verb.id': {
          $in: verbIds,
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
 * @type {immutable.Map[]}
 */
const filters = [
  buildFilter('Completions', ['http://adlnet.gov/expapi/verbs/completed']),
  buildFilter('Comments', ['http://adlnet.gov/expapi/verbs/commented']),
  buildFilter('Voted Up', ['http://adlnet.gov/expapi/verbs/voted-up']),
  buildFilter('Shared', ['http://adlnet.gov/expapi/verbs/shared']),
];

/**
 * @param {immutable.Map} model
 * @returns {immutable.Map}
 */
const buildModel = model =>
  model
    .set('type', TEMPLATE_STREAM_USER_ENGAGEMENT_LEADERBOARD)
    .set('description', description)
    .set('axesgroup', new Map({ optionKey: 'people', searchString: 'Person' }))
    .set('axesoperator', 'uniqueCount')
    .set('axesvalue', new Map({ optionKey: 'statements', searchString: 'Statements' }))
    .set('axesxLabel', 'Statements')
    .set('axesyLabel', 'Person')
    .set('filters', filters)
    .set('previewPeriod', LAST_7_DAYS);

export default buildModel;
