import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

const TemplateCard = ({
  title,
  image,
  onSelect,
}) => (
  <div className={styles.card} onClick={onSelect}>
    <img
      src={image}
      alt={title} />
    <p>{title}</p>
  </div>
);

export default withStyles(styles)(React.memo(TemplateCard));
