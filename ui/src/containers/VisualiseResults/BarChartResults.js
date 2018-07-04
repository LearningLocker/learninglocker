import React from 'react';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import BarChart from 'ui/components/Charts/BarChart';
import { shorten } from 'ui/utils/shorten';

export default withStatementsVisualisation(({
  getFormattedResults,
  results,
  labels,
  colors,
  stacked,
  axes
}) =>
  (
    <BarChart
      results={getFormattedResults(results)}
      labels={labels}
      colors={colors}
      stacked={stacked}
      axesLabels={{
        yLabel: shorten(axes.get('xLabel', axes.getIn(['group', 'searchString'], 'X-Axis'))),
        xLabel: shorten(axes.get('yLabel', axes.getIn(['value', 'searchString'], 'Y-Axis')))
      }} />
  )
);
