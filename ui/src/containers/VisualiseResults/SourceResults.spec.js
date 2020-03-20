import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { fromJS } from 'immutable';
import { withInsertCSS } from 'ui/utils/hocs';
import SourceResults, { generateTableData, calcStats } from './SourceResults';

const data = fromJS([[
  {
    0: {
      count: 5,
      model: 'monday',
      _id: 'monday'
    }
  }
]]);

const series = fromJS(['series 1']);

const axes = fromJS({ xLabel: 'the-x-label' });

test('SourceResults generate correct data', () => {
  const result = generateTableData(data, series);
  expect(result.getIn(['monday', 'rowData', 'series 1', 0, 'count'])).toEqual(5);
});

test('SourceResults should render', () => {
  const wrappedSourceResults = withInsertCSS(SourceResults);

  const criterion = ReactTestRenderer.create(
    <wrappedSourceResults
      results={data}
      labels={series}
      axes={axes} />
  ).toJSON();

  expect(criterion).toMatchSnapshot();
});

test('calcStats should calculate stats', () => {
  const formattedResults = fromJS([
    [
      {
        a: { _id: 'a', count: 123 },
        b: { _id: 'b', count: 12.3 },
        c: { _id: 'c', count: 0.003 },
      },
      {},
    ],
    [
      {
        a: { _id: 'a', count: -12.3 },
        b: { _id: 'b', count: 7.89 },
        c: { _id: 'c', count: -45.6 },
        d: { _id: 'd', count: 4.56 },
      },
    ],
  ]);

  const actual = calcStats(formattedResults);

  expect(actual.getIn([0, 0, 'total'])).toEqual(135.303);
  expect(actual.getIn([0, 0, 'avg'])).toEqual(45.101);
  expect(actual.getIn([0, 0, 'min'])).toEqual(0.003);
  expect(actual.getIn([0, 0, 'max'])).toEqual(123);
  expect(actual.getIn([0, 0, 'rowCount'])).toEqual(3);

  expect(actual.getIn([0, 1, 'total'])).toEqual(null);
  expect(actual.getIn([0, 1, 'avg'])).toEqual(null);
  expect(actual.getIn([0, 1, 'min'])).toEqual(null);
  expect(actual.getIn([0, 1, 'max'])).toEqual(null);
  expect(actual.getIn([0, 1, 'rowCount'])).toEqual(0);

  expect(actual.getIn([1, 0, 'total'])).toEqual(-45.45);
  expect(actual.getIn([1, 0, 'avg'])).toEqual(-11.3625);
  expect(actual.getIn([1, 0, 'min'])).toEqual(-45.6);
  expect(actual.getIn([1, 0, 'max'])).toEqual(7.89);
  expect(actual.getIn([1, 0, 'rowCount'])).toEqual(4);
});
