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
  TEMPLATE_CURATR_INTERACTIONS_VS_ENGAGEMENT,
  TEMPLATE_CURATR_COMMENT_COUNT,
  TEMPLATE_CURATR_LEARNER_INTERACTIONS_BY_DATE_AND_VERB,
  TEMPLATE_CURATR_USER_ENGAGEMENT_LEADERBOARD,
  TEMPLATE_CURATR_PROPORTION_OF_SOCIAL_INTERACTIONS,
  TEMPLATE_CURATR_ACTIVITIES_WITH_MOST_COMMENTS,
} from 'lib/constants/visualise';
import {
  LEADERBOARD_GREY_IMAGE,
  LEADERBOARD_IMAGE,
  STATEMENTS_GREY_IMAGE,
  STATEMENTS_IMAGE,
  XVSY_GREY_IMAGE,
  XVSY_IMAGE,
  COUNTER_GREY_IMAGE,
  COUNTER_IMAGE,
  FREQUENCY_GREY_IMAGE,
  FREQUENCY_IMAGE,
  PIE_GREY_IMAGE,
  PIE_IMAGE,
  TABLE_GREY_IMAGE,
  TABLE_IMAGE,
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
    switch (type) {
      case LEADERBOARD:
      case XVSY:
      case STATEMENTS:
      case FREQUENCY:
      case COUNTER:
      case PIE:
        return TABLE_IMAGE;
      default:
        return TABLE_GREY_IMAGE;
    }
  }

  switch (type) {
    case LEADERBOARD:
      return LEADERBOARD_IMAGE;
    case TEMPLATE_MOST_ACTIVE_PEOPLE:
    case TEMPLATE_MOST_POPULAR_ACTIVITIES:
    case TEMPLATE_MOST_POPULAR_VERBS:
    case TEMPLATE_CURATR_USER_ENGAGEMENT_LEADERBOARD:
    case TEMPLATE_CURATR_ACTIVITIES_WITH_MOST_COMMENTS:
      return LEADERBOARD_GREY_IMAGE;
    case XVSY:
      return XVSY_IMAGE;
    case TEMPLATE_CURATR_INTERACTIONS_VS_ENGAGEMENT:
      return XVSY_GREY_IMAGE;
    case STATEMENTS:
      return STATEMENTS_IMAGE;
    case TEMPLATE_WEEKDAYS_ACTIVITY:
    case TEMPLATE_CURATR_LEARNER_INTERACTIONS_BY_DATE_AND_VERB:
      return STATEMENTS_GREY_IMAGE;
    case FREQUENCY:
      return FREQUENCY_IMAGE;
    case TEMPLATE_ACTIVITY_OVER_TIME:
      return FREQUENCY_GREY_IMAGE;
    case COUNTER:
      return COUNTER_IMAGE;
    case TEMPLATE_LAST_7_DAYS_STATEMENTS:
    case TEMPLATE_CURATR_COMMENT_COUNT:
      return COUNTER_GREY_IMAGE;
    case PIE:
      return PIE_IMAGE;
    case TEMPLATE_CURATR_PROPORTION_OF_SOCIAL_INTERACTIONS:
      return PIE_GREY_IMAGE;
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

  // TODO: alt should be mapped from image src, not type
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
