import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { withInsertCSS } from 'ui/utils/hocs';
import { List, fromJS, Map } from 'immutable';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import BarChart from './BarChart';

const WrappedBarChart = withInsertCSS(BarChart);

test('BarChartResults should render', () => {
  const mockStore = createStore(
    (data, action) => {
      switch (action.type) {
        case '@@redux/INIT':
          return data;
        default:
          return data;
      }
    },
    {
      metadata: new Map()
    }
  );

  const mockModel = new Map({
    _id: '1111111111111111'
  });

  const barChart = ReactTestRenderer.create(
    <Provider store={mockStore}>
      <WrappedBarChart
        results={new List()}
        model={mockModel} />
    </Provider>
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

  const mockStore = createStore(
    (data, action) => {
      switch (action.type) {
        case '@@redux/INIT':
          return data;
        default:
          return data;
      }
    },
    { // state
      metadata: new Map()
    }
  );

  const mockModel = new Map({
    _id: '1111111111111111',
  });

  const barChart = ReactTestRenderer.create(
    <Provider store={mockStore}>
      <WrappedBarChart
        results={mockResult}
        labels={fromJS([undefined])}
        axesLabels={{
          yLabel: 'THE-Y',
          xLabel: 'THE-X'
        }}
        chartWrapperFn={() => (<div />)}
        model={mockModel} />
    </Provider>
  ).toJSON();

  expect(barChart).toMatchSnapshot();
});
