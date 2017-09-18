import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { withInsertCSS } from 'ui/utils/hocs';
import { Map } from 'immutable';
import { initialSections } from 'ui/redux/modules/queryBuilder';
import CriterionWithStyles, { Criterion } from './Criterion.js';

const WrappedCriterion = withInsertCSS(CriterionWithStyles);

test('Criterion should render', () => {
  const section = initialSections.getIn(['result', 'children', 'scaled']);
  const criterion = ReactTestRenderer.create(
    <WrappedCriterion
      section={section} />
  ).toJSON();

  expect(criterion).toMatchSnapshot();
});

test('Criterion with value', () => {
  const section = initialSections.getIn(['result', 'children', 'scaled']);

  const mockCriteria = new Map({
    'statement.result.score.scaled': new Map({
      $gt: 0.6
    })
  });

  const criterion = ReactTestRenderer.create(
    <WrappedCriterion
      criterion={mockCriteria}
      section={section} />
  ).toJSON();

  expect(criterion).toMatchSnapshot();
});

test('Criterion operator change', () => {
  const mockMerge = jest.fn();

  const onCriterionChange = jest.fn().mockReturnValueOnce({
    merge: mockMerge
  });

  const testCriterion = new Criterion({
    criterion: new Map({
      $comment: 'A comment',
    }),
    section: initialSections.getIn(['result', 'children', 'scaled']),
    onCriterionChange,
    onDeleteCriterion: jest.fn()
  });


  testCriterion.changeOperator('<=');

  expect(onCriterionChange.mock.calls.length).toEqual(1);
  expect(onCriterionChange.mock.calls[0][0].get('statement.result.score.scaled')).toEqual(new Map({ $lte: '' }));
});

test('Criterion value change', () => {
  const mockMerge = jest.fn();

  const onCriterionChange = jest.fn().mockReturnValueOnce({
    merge: mockMerge
  });

  const testCriterion = new Criterion({
    criterion: new Map({
      $comment: 'A comment',
    }),
    section: initialSections.getIn(['result', 'children', 'scaled']),
    onCriterionChange,
    onDeleteCriterion: jest.fn()
  });


  testCriterion.handleValueChange({
    target: {
      value: '0.5'
    }
  });

  expect(onCriterionChange.mock.calls.length).toEqual(1);
  expect(onCriterionChange.mock.calls[0][0].get('statement.result.score.scaled')).toEqual(new Map({ $gt: 0.5 }));
});
