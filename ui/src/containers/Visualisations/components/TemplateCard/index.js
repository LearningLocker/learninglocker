import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

/**
 * @param {string} props.title
 * @param {image file} props.srcImage
 * @param {() => void} props.onClick
 */
const TemplateCard = ({
  title,
  srcImage,
  onClick,
}) => (
  <div className={styles.card} onClick={onClick} >
    <img
      src={srcImage}
      alt={title} />
    <p>{title}</p>
  </div>
);

TemplateCard.propTypes = {
  title: PropTypes.string.isRequired,
  srcImage: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default withStyles(styles)(React.memo(TemplateCard));
