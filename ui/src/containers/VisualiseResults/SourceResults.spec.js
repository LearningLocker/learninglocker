import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { fromJS } from 'immutable';
import { withInsertCSS } from 'ui/utils/hocs';
import SourceResults, { generateTableData } from './SourceResults';

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
