import React from 'react';
import PropTypes from 'prop-types';
import { Map, fromJS } from 'immutable';
import { TEMPLATE_CURATR_COMMENT_COUNT } from 'lib/constants/visualise';
import { COUNTER_IMAGE } from 'ui/components/VisualiseIcon/assets';
import { LAST_7_DAYS } from 'ui/utils/constants';
import TemplateCard from '../components/TemplateCard';

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
 * @param {immutable.Map} props.model
 * @param {() => void} props.saveModel
 */
const Card = ({
  model,
  saveModel,
}) => (
  <TemplateCard
    title="Curatr: Comment Count"
    srcImage={COUNTER_IMAGE}
    onClick={() => {
      saveModel({
        attrs: model
          .set('type', TEMPLATE_CURATR_COMMENT_COUNT)
          .set('description', 'Curatr: Comment Count - Last 7 vs Previous 7')
          .set('previewPeriod', LAST_7_DAYS)
          .set('filters', [filter])
          .set('axesoperator', 'uniqueCount')
          .set('axesvalue', new Map({ optionKey: 'statements', searchString: 'Statements' }))
          .set('benchmarkingEnabled', true)
      });
    }} />
);

Card.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
  saveModel: PropTypes.func.isRequired,
};

export default React.memo(Card);
