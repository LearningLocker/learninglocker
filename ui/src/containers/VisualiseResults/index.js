import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps } from 'recompose';
import {
  XVSY,
  STATEMENTS,
  FREQUENCY,
  COUNTER,
  PIE,
} from 'lib/constants/visualise';
import { withModel } from 'ui/utils/hocs';
import XvsYChartResults from 'ui/containers/VisualiseResults/XvsYChartResults';
import LineChartResults from 'ui/containers/VisualiseResults/LineChartResults';
import ColumnChartResults from 'ui/containers/VisualiseResults/ColumnChartResults';
import CounterResults from 'ui/containers/VisualiseResults/CounterResults';
import PieChartResults from 'ui/containers/VisualiseResults/PieChartResults';

import styles from './visualiseresults.css';

const VisualiseResults = ({ model }) => {
  const visualisationType = model.get('type');
  const visualisationId = model.get('_id');

  switch (visualisationType) {
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
};

// [Viz Refactor] TODO: Remove this component and put each ChartResults in Visualisations/.../Viewer
export default compose(
  withStyles(styles),
  withProps({
    schema: 'visualisation'
  }),
  withModel
)(VisualiseResults);
