import React from 'react';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import BarChart from 'ui/components/Charts/BarChart';

export default withStatementsVisualisation(({
  getFormattedResults,
  results,
  labels,
  colors,
  stacked,
  axes
}) => (
  <BarChart
    results={getFormattedResults(results)}
    labels={labels}
    colors={colors}
    stacked={stacked}
    axesLabels={{
      xLabel: axes.get('xLabel', 'X-Axes'),
      yLabel: axes.get('yLabel', 'Y-Axes')
    }} />
));
