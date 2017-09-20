import React, { Component, PropTypes } from 'react';
import {
  LEADERBOARD,
  COUNTER,
  PIE,
  XVSY,
  STATEMENTS,
  FREQUENCY
} from '../../utils/constants';

export default class VisualiseIcon extends Component {
  static propTypes = {
    type: PropTypes.string
  }

  getText = (type) => {
    switch (type) {
      case LEADERBOARD: return 'Use the bar graph (people) to benchmark your users against each other, answering the question, which users have done the most?';
      case XVSY: return 'Use the Correlation graph to compare people against two variables. Use it to answer the question, is there any relationship between X and Y?';
      case STATEMENTS: return 'Use the Column Graph to show statements over time. Use it to answer the question, how much activity has there been?';
      case FREQUENCY: return 'Use the Frequency graph to show statements over time in multiple series. Up to 5 series can be shown. Use it to answer the question, how does the activity of X compare to the activity of Y?';
      case COUNTER: return 'Use the Counter visualisation to show a single number (e.g. total number of users)';
      case PIE: return 'Use the Pie chart to show show how your statements are divided (e.g. number of statements per course)';
      default: return '';
    }
  }

  render = () => {
    const { type } = this.props;

    return (
      <p>
        {this.getText(type)}
      </p>
    );
  }
}
