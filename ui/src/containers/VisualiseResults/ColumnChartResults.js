import React from 'react';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import { shorten } from 'ui/utils/defaultTitles';
import ColumnChart from 'ui/components/Charts/ColumnChart';

export default withStatementsVisualisation((props) => {
  const { getFormattedResults, results, labels, colors, stacked, axes, model } = props;
  return (
    <ColumnChart
      results={getFormattedResults(results)}
      labels={labels}
      colors={colors}
      stacked={stacked}
      model={model}
      axesLabels={{
        xLabel: shorten(axes.get('xLabel', axes.getIn(['group', 'searchString'], 'X-Axis'))),
        yLabel: axes.get('yLabel', axes.getIn(['value', 'searchString'], 'Y-Axis'))
      }} />
  );
});
