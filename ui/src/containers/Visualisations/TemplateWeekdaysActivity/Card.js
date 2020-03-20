import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import TemplateCard from '../components/TemplateCard';
import buildModel from './buildModel';
import { title, image } from './constants';

/**
 * @param {immutable.Map} props.model
 * @param {() => void} props.saveModel
 */
const Card = ({
  model,
  saveModel,
}) => (
  <TemplateCard
    title={title}
    srcImage={image}
    onClick={() => saveModel({ attrs: buildModel(model) })} />
);

Card.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
  saveModel: PropTypes.func.isRequired,
};

export default React.memo(Card);
