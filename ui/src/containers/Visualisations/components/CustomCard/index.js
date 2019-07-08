import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

/**
 * @param {string} props.title
 * @param {image file} props.srcImage
 * @param {boolean} props.active
 * @param {() => void} props.onClick
 */
const CustomCard = ({
  title,
  srcImage,
  active,
  onClick,
}) => {
  const classes = classNames({
    [styles.visualisationIcon]: true,
    [styles.active]: active
  });

  return (
    <div className={classes} onClick={onClick} >
      <img
        src={srcImage}
        alt={title} />
      <h5>{title}</h5>
    </div>
  );
};

CustomCard.propTypes = {
  title: PropTypes.string.isRequired,
  srcImage: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default withStyles(styles)(React.memo(CustomCard));
