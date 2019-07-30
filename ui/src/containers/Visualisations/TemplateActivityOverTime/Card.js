import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { TEMPLATE_ACTIVITY_OVER_TIME } from 'lib/constants/visualise';
import { FREQUENCY_IMAGE } from 'ui/components/VisualiseIcon/assets';
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
    title="How has activity changed over time?"
    srcImage={FREQUENCY_IMAGE}
    onClick={() => {
      saveModel({
        attrs: model
          .set('type', TEMPLATE_ACTIVITY_OVER_TIME)
          .set('description', 'How has activity changed over time?')
          .set('previewPeriod', LAST_2_MONTHS),
      });
    }} />
);

Card.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
  saveModel: PropTypes.func.isRequired,
};

export default React.memo(Card);
