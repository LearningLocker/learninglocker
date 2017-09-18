import React from 'react';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import ColumnChart from 'ui/components/Charts/ColumnChart';

export default withStatementsVisualisation(({ getFormattedResults, results, labels, colors, stacked, axes }) => (
  <ColumnChart
    results={getFormattedResults(results)}
    labels={labels}
    colors={colors}
    stacked={stacked}
    axesLabels={{
      xLabel: axes.get('xLabel', 'X-Axes'),
      yLabel: axes.get('yLabel', 'Y-Axes')
    }} />
));
