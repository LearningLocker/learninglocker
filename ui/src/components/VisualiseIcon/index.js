/* eslint-disable react/jsx-indent */
import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classNames from 'classnames';
import styles from './visualiseicon.css';
import {
  LEADERBOARD,
  PLATFORMS,
  QUESTIONANALYSIS,
  XVSY,
  SESSIONS,
  STATEMENTS,
  FREQUENCY,
  COUNTER,
  PIE,
} from '../../utils/constants';
import LEADERBOARD_IMAGE from './assets/ll-icon-bar-graph.png';
import XVSY_IMAGE from './assets/ll-icon-correlation.png';
import STATEMENTS_IMAGE from './assets/ll-icon-column-graph.png';
import FREQUENCY_IMAGE from './assets/ll-icon-frequency.png';
import COUNTER_IMAGE from './assets/ll-icon-counter.png';
import PIE_IMAGE from './assets/ll-icon-pie-chart.png';
import SESSIONS_IMAGE from './assets/ll-icon-accumulation.png';

const PLATFORMS_IMAGE = SESSIONS_IMAGE;
const QUESTIONANALYSIS_IMAGE = SESSIONS_IMAGE;

class VisualiseIcon extends Component {
  static propTypes = {
    type: PropTypes.string,
    active: PropTypes.bool,
    onClick: PropTypes.func,
    isSmall: PropTypes.bool,
  }

  static defaultProps = {
    active: false,
    onClick: () => null,
    isSmall: false,
  }

  getTitle = (type) => {
    switch (type) {
      case LEADERBOARD: return 'Bar';
      case XVSY: return 'Correlation';
      case STATEMENTS: return 'Column';
      case FREQUENCY: return 'Line';
      case COUNTER: return 'Counter';
      case PIE: return 'Pie';

      case SESSIONS: return 'Sessions';
      case PLATFORMS: return 'Platforms';
      case QUESTIONANALYSIS: return 'Question analysis';
      default: return '';
    }
  }

  getIcon = (type) => {
    switch (type) {
      case LEADERBOARD: return LEADERBOARD_IMAGE;
      case XVSY: return XVSY_IMAGE;
      case STATEMENTS: return STATEMENTS_IMAGE;
      case FREQUENCY: return FREQUENCY_IMAGE;
      case COUNTER: return COUNTER_IMAGE;
      case PIE: return PIE_IMAGE;
      case SESSIONS: return SESSIONS_IMAGE;
      case PLATFORMS: return PLATFORMS_IMAGE;
      case QUESTIONANALYSIS: return QUESTIONANALYSIS_IMAGE;
      default: return '';
    }
  }

  renderIcon = () => {
    const { type } = this.props;
    return (
      <img src={this.getIcon(type)} alt={this.getTitle(type)} />
    );
  }

  render = () => {
    const { type, active, onClick, isSmall } = this.props;
    const classes = classNames({
      [styles['visualisation-icon']]: true,
      [styles.active]: active
    });

    return (
      isSmall
      ? this.renderIcon()
      : (
        <div className={classes} onClick={onClick} >
          { this.renderIcon() }
          <h5>{this.getTitle(type)}</h5>
        </div>
      )
    );
  }
}

export default withStyles(styles)(VisualiseIcon);
