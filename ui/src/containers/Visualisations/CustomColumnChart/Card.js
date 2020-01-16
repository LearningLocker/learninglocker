import React from 'react';
import PropTypes from 'prop-types';
import { STATEMENTS_IMAGE } from 'ui/components/VisualiseIcon/assets';
import CustomCard from '../components/CustomCard';

/**
 * @param {boolean} props.active
 * @param {() => void} props.onClick
 */
const Card = ({
  active,
  onClick,
}) => (
  <CustomCard
    title="Column"
    srcImage={STATEMENTS_IMAGE}
    active={active}
    onClick={onClick} />
);

Card.propTypes = {
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default React.memo(Card);
