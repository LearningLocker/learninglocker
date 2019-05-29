import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import VisualiseIcon from 'ui/components/VisualiseIcon'; // TODO: Replace img
import styles from './styles.css';

const TemplateCard = ({ title, onSelect }) => (
  <div className={styles.card} onClick={onSelect}>
    <VisualiseIcon type={'PIE'} isSmall />
    <p>{title}</p>
  </div>
);

export default withStyles(styles)(TemplateCard);
