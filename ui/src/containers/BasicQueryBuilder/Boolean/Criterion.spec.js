import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { withInsertCSS } from 'ui/utils/hocs';
import { Map } from 'immutable';
import { initialSections } from 'ui/redux/modules/queryBuilder';
import CriterionWithStyles, { Criterion } from './Criterion.js';

const WrappedCriterion = withInsertCSS(CriterionWithStyles);

test('Criterion should render', () => {
  const section = initialSections.getIn(['result', 'children', 'success']);

  const criterion = ReactTestRenderer.create(
    <WrappedCriterion
      section={section} />
  ).toJSON();

  expect(criterion).toMatchSnapshot();
});

test('Criterion with value', () => {
  const section = initialSections.getIn(['result', 'children', 'success']);

  const mockCriteria = new Map({
    'statement.result.success': true
  });

  const criterion = ReactTestRenderer.create(
    <WrappedCriterion
      criterion={mockCriteria}
      section={section} />
  ).toJSON();

  expect(criterion).toMatchSnapshot();
});

test('Criterion value change', () => {
  const onCriterionChange = jest.fn().mockReturnValueOnce(true);

  const testCriterion = new Criterion({
    criterion: new Map({
      $comment: 'A comment',
    }),
    section: initialSections.getIn(['result', 'children', 'success']),
    onCriterionChange,
    onDeleteCriterion: jest.fn()
  });


  testCriterion.handleValueChange({
    target: {
      value: 'true'
    }
  });

  expect(onCriterionChange.mock.calls.length).toEqual(1);
  expect(onCriterionChange.mock.calls[0][0].get('statement.result.success')).toEqual(true);
});
