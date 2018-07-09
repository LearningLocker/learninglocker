import React from 'react';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import XvsY from 'ui/components/XvsY';

export default withStatementsVisualisation(({
  getFormattedResults,
  results,
  labels,
  colors,
  axes,
  trendLines
}) => (
  <XvsY
    colors={colors}
    results={getFormattedResults(results)}
    labels={labels}
    trendLines={trendLines}
    axesLabels={{
      xLabel: axes.get('xLabel', 'X-Axis'),
      yLabel: axes.get('yLabel', 'Y-Axis'),
    }} />
  ));
