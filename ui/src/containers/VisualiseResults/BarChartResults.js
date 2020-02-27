import React from 'react';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import BarChart from 'ui/components/Charts/BarChart';
import { shorten } from 'ui/utils/defaultTitles';

export default withStatementsVisualisation(({
  getFormattedResults,
  results,
  labels,
  colors,
  stacked,
  axes,
  model
}) =>
  (
    <BarChart
      results={getFormattedResults(results)}
      labels={labels}
      colors={colors}
      stacked={stacked}
      model={model}
      axesLabels={{
        yLabel: axes.get('yLabel', axes.getIn(['group', 'searchString'], 'Y-Axis')),
        xLabel: shorten(axes.get('xLabel', axes.getIn(['value', 'searchString'], 'X-Axis')))
      }} />
  )
);
