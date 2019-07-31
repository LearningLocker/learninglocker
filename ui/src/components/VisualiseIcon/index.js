/* eslint-disable react/jsx-indent */
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classNames from 'classnames';
import {
  LEADERBOARD,
  XVSY,
  STATEMENTS,
  FREQUENCY,
  COUNTER,
  PIE,
  TEMPLATE_ACTIVITY_OVER_TIME,
  TEMPLATE_LAST_7_DAYS_STATEMENTS,
  TEMPLATE_MOST_ACTIVE_PEOPLE,
  TEMPLATE_MOST_POPULAR_ACTIVITIES,
  TEMPLATE_MOST_POPULAR_VERBS,
  TEMPLATE_WEEKDAYS_ACTIVITY,
  TEMPLATE_CURATR_COMMENT_COUNT,
} from 'lib/constants/visualise';
import {
  COUNTER_IMAGE,
  FREQUENCY_IMAGE,
  LEADERBOARD_IMAGE,
  PIE_IMAGE,
  STATEMENTS_IMAGE,
  TABLE_IMAGE,
  XVSY_IMAGE,
} from './assets';
import styles from './style.css';

/**
 * @param {string} type
 * @returns {string}
 */
const getTitle = (type) => {
  switch (type) {
    case LEADERBOARD: return 'Bar';
    case XVSY: return 'Correlation';
    case STATEMENTS: return 'Column';
    case FREQUENCY: return 'Line';
    case COUNTER: return 'Counter';
    case PIE: return 'Pie';
    default: return '';
  }
};

/**
 * @param {string} type
 * @param {boolean} sourceView
 * @returns {string}
 */
const getImageSrc = (type, sourceView) => {
  if (sourceView) {
    return TABLE_IMAGE;
  }
  switch (type) {
    case LEADERBOARD:
    case TEMPLATE_MOST_ACTIVE_PEOPLE:
    case TEMPLATE_MOST_POPULAR_ACTIVITIES:
    case TEMPLATE_MOST_POPULAR_VERBS:
      return LEADERBOARD_IMAGE;
    case XVSY:
      return XVSY_IMAGE;
    case STATEMENTS:
    case TEMPLATE_WEEKDAYS_ACTIVITY:
      return STATEMENTS_IMAGE;
    case FREQUENCY:
    case TEMPLATE_ACTIVITY_OVER_TIME:
      return FREQUENCY_IMAGE;
    case COUNTER:
    case TEMPLATE_LAST_7_DAYS_STATEMENTS:
    case TEMPLATE_CURATR_COMMENT_COUNT:
      return COUNTER_IMAGE;
    case PIE:
      return PIE_IMAGE;
    default:
      return '';
  }
};

const VisualiseIcon = ({
  type,
  sourceView,
  isSmall = true, // // [Viz Refactor] TODO: Remove this property
}) => {
  const src = getImageSrc(type, sourceView);
  if (src === '') {
    return null;
  }

  const classes = classNames({
    [styles.visualisationSmall]: isSmall,
  });

  return (
    <img
      className={classes}
      src={src}
      alt={getTitle(type)} />
  );
};

VisualiseIcon.propTypes = {
  sourceView: PropTypes.bool.isRequired,
  type: PropTypes.string,
  isSmall: PropTypes.bool,
};

export default withStyles(styles)(React.memo(VisualiseIcon));

// [Viz Refactor] TODO: Remove VisualiseIconWithTitle after every types are refactored in TypeEditor
const VisualiseIconWithTitle = ({
  type,
  active,
  onClick,
}) => {
  const classes = classNames({
    [styles.visualisationIcon]: true,
    [styles.active]: active,
  });

  return (
    <div className={classes} onClick={onClick} >
      <VisualiseIcon
        type={type}
        sourceView={false}
        isSmall={false} />
      <h5>{getTitle(type)}</h5>
    </div>
  );
};

VisualiseIconWithTitle.propTypes = {
  type: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export const StyledVisualiseIconWithTitle = withStyles(styles)(VisualiseIconWithTitle);
