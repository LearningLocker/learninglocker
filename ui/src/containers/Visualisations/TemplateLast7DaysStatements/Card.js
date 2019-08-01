import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { TEMPLATE_LAST_7_DAYS_STATEMENTS } from 'lib/constants/visualise';
import { COUNTER_IMAGE } from 'ui/components/VisualiseIcon/assets';
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
    title="How many statements have been stored in the last 7 days?"
    srcImage={COUNTER_IMAGE}
    onClick={() => {
      saveModel({
        attrs: model
          .set('type', TEMPLATE_LAST_7_DAYS_STATEMENTS)
          .set('description', 'How many statements have been stored in the last 7 days?')
      });
    }} />
);

Card.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
  saveModel: PropTypes.func.isRequired,
};

export default React.memo(Card);
