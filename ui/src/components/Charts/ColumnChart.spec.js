import React from 'react';
import 'jest-styled-components';
import renderer from 'react-test-renderer';
import { fromJS } from 'immutable';
import ColumnChart from './ColumnChart';

describe('ColumnChartResult', () => {
  test('should render axes', () => {
    const mockResult = fromJS([[{
      '1970-01-01': {
        _id: '1970-01-01',
        count: 1,
        model: '1970-01-01'
      }
    }]]);

    const columnChart = renderer
      .create(
        <ColumnChart
          results={mockResult}
          labels={fromJS([undefined])}
          axesLabels={{
            yLabel: 'THE-Y',
            xLabel: 'THE-X'
          }}
          chartWrapperFn={() => (<div />)} />
      )
      .toJSON();

    expect(columnChart).toMatchSnapshot();
  });
});
