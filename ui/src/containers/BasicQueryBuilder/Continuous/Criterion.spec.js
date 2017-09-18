import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { withInsertCSS } from 'ui/utils/hocs';
import moment from 'moment';
import { fromJS } from 'immutable';
import Criterion from './Criterion.js';

const WrappedCriterion = withInsertCSS(Criterion);

test('renders criterion', () => {
  const criterion = ReactTestRenderer.create(<WrappedCriterion />).toJSON();
  expect(criterion).toMatchSnapshot();
});

test('render criterion with value', () => {
  const testDate = moment('1986-10-31', 'YYYY-MM-DD');
  const criterion = fromJS({
    timestamp: {
      $gt: {
        $dte: testDate.toISOString()
      }
    }
  });

  const section = fromJS({
    keyPath: ['timestamp'],
    getValueQuery: value => value,
    getQueryDisplay: value => value
  });

  const onDeleteCriterion = () => null;

  const criterionOut = ReactTestRenderer.create(
    <WrappedCriterion
      criterion={criterion}
      section={section}
      onDeleteCriterion={onDeleteCriterion} />
  ).toJSON();
  expect(criterionOut).toMatchSnapshot();
});
