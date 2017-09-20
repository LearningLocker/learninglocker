import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { withInsertCSS } from 'ui/utils/hocs';
import { fromJS } from 'immutable';
import ColumnChart from './ColumnChart';

const WrappedColumnChart = withInsertCSS(ColumnChart);

test('ColumnChartResult should render axes', () => {
  const mockResult = fromJS([[{
    '1970-01-01': {
      _id: '1970-01-01',
      count: 1,
      model: '1970-01-01'
    }
  }]]);

  const columnChart = ReactTestRenderer.create(
    <WrappedColumnChart
      results={mockResult}
      labels={fromJS([undefined])}
      axesLabels={{
        yLabel: 'THE-Y',
        xLabel: 'THE-X'
      }}
      chartWrapperFn={() => (<div />)} />
  ).toJSON();

  expect(columnChart).toMatchSnapshot();
});
