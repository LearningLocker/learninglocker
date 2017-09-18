import React from 'react';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import LineChart from 'ui/components/Charts/LineChart';

export default withStatementsVisualisation(({
  getFormattedResults, results, labels, colors, previewPeriod, axes
}) => (
  <LineChart
    results={getFormattedResults(results)}
    labels={labels}
    colors={colors}
    preview={previewPeriod}
    axesLabels={{
      xLabel: axes.get('xLabel', 'X-Axes'),
      yLabel: axes.get('yLabel', 'Y-Axes')
    }} />
));
