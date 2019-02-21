import React from 'react';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import PieChart from 'ui/components/Charts/PieChart';

export default withStatementsVisualisation(({
  getFormattedResults,
  results,
  labels,
  colors,
  visualisation,
  model
}) => (
  <PieChart
    results={getFormattedResults(results)}
    labels={labels}
    isDonut={model.get('isDonut')}
    count={visualisation.getIn(['axesvalue', 'searchString'], 'Count')}
    grouping={visualisation.getIn(['axesgroup', 'searchString'], 'Group')}
    colors={colors} />
));
