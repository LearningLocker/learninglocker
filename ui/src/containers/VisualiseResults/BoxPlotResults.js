import React from 'react';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import BoxPlot from 'ui/components/Charts/BoxPlot';
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
    <BoxPlot
      results={getFormattedResults(results)}
      labels={labels}
      colors={colors}
      stacked={stacked}
      model={model}
      axesLabels={{
        yLabel: shorten(axes.get('yLabel', axes.getIn(['group', 'searchString'], 'Y-Axis'))),
        xLabel: shorten(axes.get('xLabel', axes.getIn(['value', 'searchString'], 'X-Axis')))
      }} />
  )
);
