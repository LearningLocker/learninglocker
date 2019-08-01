import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { TEMPLATE_MOST_POPULAR_VERBS } from 'lib/constants/visualise';
import { LEADERBOARD_IMAGE } from 'ui/components/VisualiseIcon/assets';
import { LAST_2_MONTHS } from 'ui/utils/constants';
import TemplateCard from '../components/TemplateCard';

/**
 * @param {immutable.Map} props.model
 * @param {() => void} props.saveModel
 */
const Card = ({
  model,
  saveModel,
}) => (
  <TemplateCard
    title="What are the most popular verbs?"
    srcImage={LEADERBOARD_IMAGE}
    onClick={() => {
      saveModel({
        attrs: model
          .set('type', TEMPLATE_MOST_POPULAR_VERBS)
          .set('description', 'What are the most popular verbs?')
          .set('previewPeriod', LAST_2_MONTHS)
          .set('axesgroup', new Map({ optionKey: 'verb', searchString: 'Verb' })),
      });
    }} />
);

Card.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
  saveModel: PropTypes.func.isRequired,
};

export default React.memo(Card);
