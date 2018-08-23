import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import BarChartResults from 'ui/containers/VisualiseResults/BarChartResults';
import XvsYChartResults from 'ui/containers/VisualiseResults/XvsYChartResults';
import LineChartResults from 'ui/containers/VisualiseResults/LineChartResults';
import ColumnChartResults from 'ui/containers/VisualiseResults/ColumnChartResults';
import CounterResults from 'ui/containers/VisualiseResults/CounterResults';
import PieChartResults from 'ui/containers/VisualiseResults/PieChartResults';
import {
  LEADERBOARD,
  XVSY,
  STATEMENTS,
  FREQUENCY,
  COUNTER,
  PIE,
} from 'ui/utils/constants';
import styles from './visualiseresults.css';

export default compose(
  withStyles(styles),
  withProps({
    schema: 'visualisation'
  }),
  withModel
)(({ model }) => {
  const visualisationType = model.get('type');
  const visualisationId = model.get('_id');

  switch (visualisationType) {
    case LEADERBOARD:
      return <BarChartResults id={visualisationId} />;
    case STATEMENTS:
      return <ColumnChartResults id={visualisationId} />;
    case XVSY:
      return <XvsYChartResults id={visualisationId} />;
    case COUNTER:
      return <CounterResults id={visualisationId} />;
    case PIE:
      return <PieChartResults id={visualisationId} />;
    case FREQUENCY:
      return <LineChartResults id={visualisationId} />;
    default:
      return <noscript />;
  }
});
