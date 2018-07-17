import React from 'react';
import {
  withStatementsVisualisation,
} from 'ui/utils/hocs';
import Counter from 'ui/components/Counter';
import { compose } from 'recompose';

const Component = ({ results, colors }) => {
  return (
    <Counter
      color={colors.get(0)}
      results={results} />
  );
};

export default compose(
  withStatementsVisualisation,
)(Component);
