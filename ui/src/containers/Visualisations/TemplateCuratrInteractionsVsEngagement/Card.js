import React from 'react';
import PropTypes from 'prop-types';
import { Map, fromJS } from 'immutable';
import { TEMPLATE_CURATR_INTERACTIONS_VS_ENGAGEMENT } from 'lib/constants/visualise';
import { XVSY_IMAGE } from 'ui/components/VisualiseIcon/assets';
import { LAST_7_DAYS } from 'ui/utils/constants';
import TemplateCard from '../components/TemplateCard';

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
        $comment: '{"criterionLabel":"A","criteriaPath":["statement","context","platform"]}',
        'statement.context.platform': {
          $in: [
            'Curatr',
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
        $comment: '{"criterionLabel":"A","criteriaPath":["statement","context","platform"]}',
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
 * @param {immutable.Map} props.model
 * @param {() => void} props.saveModel
 */
const Card = ({
  model,
  saveModel,
}) => (
  <TemplateCard
    title="Curatr: Interactions vs Engagement"
    srcImage={XVSY_IMAGE}
    onClick={() => {
      saveModel({
        attrs: model
          .set('type', TEMPLATE_CURATR_INTERACTIONS_VS_ENGAGEMENT)
          .set('description', 'Curatr: Interactions vs Engagement - last 7 days')
          .set('previewPeriod', LAST_7_DAYS)
          .set('axesgroup', new Map({ optionKey: 'people', searchString: 'Person'}))
          .set('axesxLabel', 'Engagement (completed/commented/shared/voted up)')
          .set('axesxOperator', 'uniqueCount')
          .set('axesxValue', new Map({ optionKey: 'statements', searchString: 'Statements' }))
          .set('axesxQuery', axesxQuery)
          .set('axesyLabel', 'Interactions (login/accessed/opened)')
          .set('axesyOperator', 'uniqueCount')
          .set('axesyValue', new Map({ optionKey: 'statements', searchString: 'Statements' }))
          .set('axesyQuery', axesyQuery)
          .set('trendLines', true),
      });
    }} />
);

Card.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
  saveModel: PropTypes.func.isRequired,
};

export default React.memo(Card);
