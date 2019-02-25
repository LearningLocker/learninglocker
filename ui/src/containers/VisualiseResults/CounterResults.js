import React from 'react';
import {
  withStatementsVisualisation,
} from 'ui/utils/hocs';
import Counter from 'ui/components/Counter';
import { compose } from 'recompose';
import { AutoSizer } from 'react-virtualized';

const component = args => ({ width, height }) => {
  const { results, colors, model } = args;
  return (
    <Counter
      color={colors.get(0)}
      results={results}
      model={model}
      width={width}
      height={height} />
  );
};

const Sizer = (...args) => <AutoSizer style={{ minHeight: '100%' }}>{component(...args)}</AutoSizer>;

export default compose(
  withStatementsVisualisation,
)(Sizer);
