import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { TEMPLATE_WEEKDAYS_ACTIVITY } from 'lib/constants/visualise';
import { STATEMENTS_IMAGE } from 'ui/components/VisualiseIcon/assets';
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
    title="How does activity change in a week?"
    srcImage={STATEMENTS_IMAGE}
    onClick={() => {
      saveModel({
        attrs: model
          .set('type', TEMPLATE_WEEKDAYS_ACTIVITY)
          .set('description', 'How does activity change in a week?')
          .set('axesgroup', new Map({ optionKey: 'weekday', searchString: 'Day' })),
      });
    }} />
);

Card.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
  saveModel: PropTypes.func.isRequired,
};

export default React.memo(Card);
