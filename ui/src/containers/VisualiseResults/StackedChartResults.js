import React from 'react';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import { shorten } from 'ui/utils/defaultTitles';
import StackedAreaChart from 'ui/components/Charts/StackedAreaChart';

export default withStatementsVisualisation(({
  getFormattedResults, results, labels, colors, previewPeriod, axes, model
}) => {
  console.log('model stackchartres', model)
  return (
  <StackedAreaChart
    results={getFormattedResults(results)}
    labels={labels}
    colors={colors}
    preview={previewPeriod}
    model={model}
    axesLabels={{
      xLabel: shorten(axes.get('xLabel', axes.getIn(['group', 'searchString'], 'yyyy-mm-dd'))),
      yLabel: shorten(axes.get('yLabel', axes.getIn(['value', 'searchString'], 'Y-Axis')))
    }} />
)}
);
