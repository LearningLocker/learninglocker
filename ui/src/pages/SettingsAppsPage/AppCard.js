import React from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

/**
 * App Card
 *
 * @param {object} props -- {
 *                            link: string
 *                            title: string
 *                            description: string
 *                            icon: string
 *                            icon2x?: string
 *                          }
 */
const AppCard = ({
  title,
  description,
  icon,
  icon2x,
}) => (
  <div className={classNames(styles.card, 'panel panel-default')}>
    <img
      className={styles.cardIcon}
      src={icon}
      srcSet={`${icon} 1x, ${icon2x || icon} 2x`}
      alt={title} />

    <h1 className={styles.cardTitle} >{title}</h1>
    <p>{description}</p>
  </div>
);

export default withStyles(styles)(AppCard);
