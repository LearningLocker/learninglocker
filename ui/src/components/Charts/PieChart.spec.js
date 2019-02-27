import React from 'react';
import 'jest-enzyme';
import { List, fromJS } from 'immutable';
import { render, shallow } from 'enzyme';
import { PieChartComponent } from './PieChart';


test('PieChart should render no data', () => {
  const pieChart = shallow(<PieChartComponent
    results={new List()} />);

  expect(pieChart).toMatchSnapshot();
});

test('PieChart should render', () => {
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

  const pieChart = render(<PieChartComponent
    results={results}
    labels={fromJS([undefined])}
    colors={fromJS(['#ffffff', '#123456'])} />);

  expect(pieChart).toMatchSnapshot();
});
