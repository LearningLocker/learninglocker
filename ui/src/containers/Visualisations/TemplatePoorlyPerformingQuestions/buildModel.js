import { fromJS } from 'immutable';
import { TEMPLATE_POORLY_PERFORMING_QUESTIONS } from 'lib/constants/visualise';
import { LAST_7_DAYS } from 'ui/utils/constants';
import { description } from './constants';

const filter = fromJS({
  $match: {
    $and: [
      {
        $comment: '{"criterionLabel":"A","criteriaPath":["statement","object","definition","type"]}',
        'statement.object.definition.type': {
          $in: [
            'http://adlnet.gov/expapi/activities/assessment',
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
    .set('type', TEMPLATE_POORLY_PERFORMING_QUESTIONS)
    .set('description', description)
    .set('filters', [filter])
    .set('previewPeriod', LAST_7_DAYS);

export default buildModel;
