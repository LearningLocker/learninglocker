import React from 'react';
import { withStatementsVisualisation } from 'ui/utils/hocs';
import Counter from 'ui/components/Counter';

export default withStatementsVisualisation(({ results, colors }) => (
  <Counter
    color={colors.get(0)}
    results={results} />
));
