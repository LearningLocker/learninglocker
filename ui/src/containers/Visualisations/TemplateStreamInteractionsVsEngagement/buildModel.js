import { Map, fromJS } from 'immutable';
import { TEMPLATE_STREAM_INTERACTIONS_VS_ENGAGEMENT } from 'lib/constants/visualise';
import { LAST_7_DAYS } from 'ui/utils/constants';
import { description } from './constants';

const axesxQuery = fromJS({
  $match: {
    $and: [
      {
        $comment: '{"criterionLabel":"A","criteriaPath":["statement","verb"]}',
        'statement.verb.id': {
          $in: [
            'http://adlnet.gov/expapi/verbs/completed',
            'http://adlnet.gov/expapi/verbs/commented',
            'http://curatr3.com/define/verb/voted-up',
            'http://adlnet.gov/expapi/verbs/shared',
            'http://adlnet.gov/expapi/verbs/attempted',
            'http://adlnet.gov/expapi/activities/attempt',
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

const axesyQuery = fromJS({
  $match: {
    $and: [
      {
        $comment: '{"criterionLabel":"A","criteriaPath":["statement","verb"]}',
        'statement.verb.id': {
          $in: [
            'https://brindlewaye.com/xAPITerms/verbs/loggedin/',
            'http://activitystrea.ms/schema/1.0/open',
            'http://activitystrea.ms/schema/1.0/access',
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
    .set('type', TEMPLATE_STREAM_INTERACTIONS_VS_ENGAGEMENT)
    .set('description', description)
    .set('axesgroup', new Map({ optionKey: 'people', searchString: 'Person' }))
    .set('axesxLabel', 'Engagement (completed/commented/shared/voted up)')
    .set('axesxOperator', 'uniqueCount')
    .set('axesxValue', new Map({ optionKey: 'statements', searchString: 'Statements' }))
    .set('axesxQuery', axesxQuery)
    .set('axesyLabel', 'Interactions (login/accessed/opened)')
    .set('axesyOperator', 'uniqueCount')
    .set('axesyValue', new Map({ optionKey: 'statements', searchString: 'Statements' }))
    .set('axesyQuery', axesyQuery)
    .set('trendLines', true)
    .set('previewPeriod', LAST_7_DAYS);

export default buildModel;
