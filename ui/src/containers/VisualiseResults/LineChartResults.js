import React from 'react';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import LineChart from 'ui/components/Charts/LineChart';
import { shorten } from 'ui/utils/defaultTitles';

export default withStatementsVisualisation(({
  getFormattedResults, results, labels, colors, previewPeriod, axes, model
}) => (
  <LineChart
    results={getFormattedResults(results)}
    labels={labels}
    colors={colors}
    preview={previewPeriod}
    model={model}
    axesLabels={{
      xLabel: axes.get('xLabel', shorten(model.getIn(['axesxValue', 'searchString'], 'X-Axis'))),
      yLabel: axes.get('yLabel', axes.getIn(['value', 'searchString'], 'Y-Axis'))
    }} />
));
