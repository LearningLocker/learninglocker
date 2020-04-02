import React from 'react';
import 'jest-styled-components';
import renderer from 'react-test-renderer';
import { Map } from 'immutable';
import { initialSections } from 'ui/redux/modules/queryBuilder';
import Criterion from './Criterion.js';

describe('BasicQueryBuilder -> Range Criterion', () => {
  test('render', () => {
    const section = initialSections.getIn(['result', 'children', 'scaled']);
    const criterion = renderer
      .create(<Criterion section={section} />)
      .toJSON();

    expect(criterion).toMatchSnapshot();
  });

  test('with value', () => {
    const section = initialSections.getIn(['result', 'children', 'scaled']);

    const mockCriteria = new Map({
      'statement.result.score.scaled': new Map({
        $gt: 0.6
      })
    });

    const criterion = renderer
      .create(<Criterion criterion={mockCriteria} section={section} />)
      .toJSON();

    expect(criterion).toMatchSnapshot();
  });

  test('operator change', () => {
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

  test('value change', () => {
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
});
