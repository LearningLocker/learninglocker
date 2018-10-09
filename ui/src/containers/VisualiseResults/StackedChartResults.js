import React from 'react';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import { shorten } from 'ui/utils/defaultTitles';
import StackedAreaChart from 'ui/components/Charts/StackedAreaChart';

export default withStatementsVisualisation((props) => {
  const { getFormattedResults, results, labels, colors, stacked, axes, model } = props;
  return (
    <StackedAreaChart
      results={getFormattedResults(results)}
      rawResults={results}
      labels={labels}
      colors={colors}
      model={model}
      axesLabels={{
        xLabel: shorten(axes.get('xLabel', axes.getIn(['group', 'searchString'], 'X-Axis'))),
        yLabel: shorten(axes.get('yLabel', axes.getIn(['value', 'searchString'], 'Y-Axis')))
      }} />
  );
});
