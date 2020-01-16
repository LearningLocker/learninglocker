import React from 'react';
import PropTypes from 'prop-types';
import CustomCard from '../components/CustomCard';
import { image, title } from './constants';

/**
 * @param {boolean} props.active
 * @param {() => void} props.onClick
 */
const Card = ({
  active,
  onClick,
}) => (
  <CustomCard
    title={title}
    srcImage={image}
    active={active}
    onClick={onClick} />
);

Card.propTypes = {
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default React.memo(Card);
