import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { withInsertCSS } from 'ui/utils/hocs';
import { fromJS } from 'immutable';
import StackedAreaChart from './StackedAreaChart';

const WrappedStackChart = withInsertCSS(StackedAreaChart);

test('LineChartResult should render axes', () => {
  const mockResult = fromJS([[{
    '1970-01-01': {
      _id: '1970-01-01',
      count: 1,
      model: '1970-01-01'
    }
  }]]);

  const stackedAreaChart = ReactTestRenderer.create(
    <WrappedStackChart
      results={mockResult}
      labels={fromJS([undefined])}
      axesLabels={{
        yLabel: 'THE-Y',
        xLabel: 'THE-X'
      }}
      chartWrapperFn={() => (<div />)} />
  ).toJSON();

  expect(stackedAreaChart).toMatchSnapshot();
});
