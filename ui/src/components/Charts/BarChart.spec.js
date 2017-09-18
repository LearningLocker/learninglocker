import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { withInsertCSS } from 'ui/utils/hocs';
import { List, fromJS } from 'immutable';
import BarChart from './BarChart';

const WrappedBarChart = withInsertCSS(BarChart);

test('BarChartResults should render', () => {
  const barChart = ReactTestRenderer.create(
    <WrappedBarChart
      results={new List()} />
  ).toJSON();

  expect(barChart).toMatchSnapshot();
});

test('BarChartResult should render axes', () => {
  const mockResult = fromJS([[{
    '1970-01-01': {
      _id: '1970-01-01',
      count: 1,
      model: '1970-01-01'
    }
  }]]);

  const barChart = ReactTestRenderer.create(
    <WrappedBarChart
      results={mockResult}
      labels={fromJS([undefined])}
      axesLabels={{
        yLabel: 'THE-Y',
        xLabel: 'THE-X'
      }}
      chartWrapperFn={() => (<div />)} />
  ).toJSON();

  expect(barChart).toMatchSnapshot();
});
