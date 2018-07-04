import React from 'react';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import LineChart from 'ui/components/Charts/LineChart';
import { shorten } from 'ui/utils/shorten';

export default withStatementsVisualisation(({
  getFormattedResults, results, labels, colors, previewPeriod, axes
}) => (
  <LineChart
    results={getFormattedResults(results)}
    labels={labels}
    colors={colors}
    preview={previewPeriod}
    axesLabels={{
      xLabel: shorten(axes.get('xLabel', axes.getIn(['group', 'searchString'], 'X-Axis'))),
      yLabel: shorten(axes.get('yLabel', axes.getIn(['value', 'searchString'], 'Y-Axis')))
    }} />
));
