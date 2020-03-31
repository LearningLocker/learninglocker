import React from 'react';
import 'jest-styled-components';
import renderer from 'react-test-renderer';
import { List, fromJS } from 'immutable';
import PieChart from './PieChart';


describe('PieChart', () => {
  test('should render no data', () => {
    const pieChart = renderer
      .create(<PieChart results={new List()} />)
      .toJSON();

    expect(pieChart).toMatchSnapshot();
  });

  test('should render', () => {
    const results = fromJS([[{
      0: {
        _id: 0,
        count: 1,
        model: 0
      },
      1: {
        _id: 1,
        count: 5,
        model: 1
      }
    }]]);

    const pieChart = renderer
      .create(<PieChart
        results={results}
        labels={fromJS([undefined])}
        colors={fromJS(['#ffffff', '#123456'])} />)
      .toJSON();

    expect(pieChart).toMatchSnapshot();
  });
});
