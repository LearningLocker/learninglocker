import React from 'react';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import PieChart from 'ui/components/Charts/PieChart';

export default withStatementsVisualisation(({
  getFormattedResults,
  results,
  labels,
  colors
}) => (
  <PieChart
    results={getFormattedResults(results)}
    labels={labels}
    colors={colors} />
));
