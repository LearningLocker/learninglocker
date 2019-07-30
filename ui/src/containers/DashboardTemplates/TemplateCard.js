import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { PIE_IMAGE } from 'ui/components/VisualiseIcon/assets';
import styles from './styles.css';

const TemplateCard = ({ title, onSelect }) => (
  <div className={styles.card} onClick={onSelect}>
    <img
      src={PIE_IMAGE}
      alt={title} />
    <p>{title}</p>
  </div>
);

export default withStyles(styles)(React.memo(TemplateCard));
