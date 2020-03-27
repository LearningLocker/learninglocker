import { Map, fromJS } from 'immutable';
import { TEMPLATE_STREAM_LEARNER_INTERACTIONS_BY_DATE_AND_VERB } from 'lib/constants/visualise';
import { LAST_30_DAYS } from 'ui/utils/constants';
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
  buildFilter('Comments', ['http://adlnet.gov/expapi/verbs/commented']),
  buildFilter('Completions', ['http://adlnet.gov/expapi/verbs/completed']),
  buildFilter('Voted Up', ['http://adlnet.gov/expapi/verbs/voted-up']),
  buildFilter('Shared', ['http://adlnet.gov/expapi/verbs/shared']),
  buildFilter('Logins', ['http://adlnet.gov/expapi/verbs/loggedin/']),
];

/**
 * @param {immutable.Map} model
 * @returns {immutable.Map}
 */
const buildModel = model =>
  model
    .set('type', TEMPLATE_STREAM_LEARNER_INTERACTIONS_BY_DATE_AND_VERB)
    .set('description', description)
    .set('axesgroup', new Map({ optionKey: 'date', searchString: 'Date' }))
    .set('axesoperator', 'uniqueCount')
    .set('axesvalue', new Map({ optionKey: 'statements', searchString: 'Statements' }))
    .set('axesxLabel', 'Date')
    .set('axesyLabel', 'Statements')
    .set('filters', filters)
    .set('previewPeriod', LAST_30_DAYS);

export default buildModel;
