import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { withInsertCSS } from 'ui/utils/hocs';
import { fromJS } from 'immutable';
import LineChart from './LineChart';

const WrappedLineChart = withInsertCSS(LineChart);

test('LineChartResult should render axes', () => {
  const mockResult = fromJS([[{
    '1970-01-01': {
      _id: '1970-01-01',
      count: 1,
      model: '1970-01-01'
    }
  }]]);

  const lineChart = ReactTestRenderer.create(
    <WrappedLineChart
      results={mockResult}
      labels={fromJS([undefined])}
      axesLabels={{
        yLabel: 'THE-Y',
        xLabel: 'THE-X'
      }}
      chartWrapperFn={() => (<div />)} />
  ).toJSON();

  expect(lineChart).toMatchSnapshot();
});
