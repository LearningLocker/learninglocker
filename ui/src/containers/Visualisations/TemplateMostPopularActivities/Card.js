import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { TEMPLATE_MOST_POPULAR_ACTIVITIES } from 'lib/constants/visualise';
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
    title="What are the most popular activities?"
    srcImage={LEADERBOARD_IMAGE}
    onClick={() => {
      saveModel({
        attrs: model
          .set('type', TEMPLATE_MOST_POPULAR_ACTIVITIES)
          .set('description', 'What are the most popular activities?')
          .set('previewPeriod', LAST_2_MONTHS)
          .set('axesgroup', new Map({ optionKey: 'activities', searchString: 'Activity' })),
      });
    }} />
);

Card.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
  saveModel: PropTypes.func.isRequired,
};

export default React.memo(Card);
