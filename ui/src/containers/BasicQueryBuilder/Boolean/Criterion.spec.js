import React from 'react';
import 'jest-styled-components';
import renderer from 'react-test-renderer';
import { Map } from 'immutable';
import { initialSections } from 'ui/redux/modules/queryBuilder';
import Criterion from './Criterion.js';

describe('BasicQueryBuilder -> Boolean Criterion', () => {
  test('should render', () => {
    const section = initialSections.getIn(['result', 'children', 'success']);

    const criterion = renderer
      .create(<Criterion section={section} />)
      .toJSON();

    expect(criterion).toMatchSnapshot();
  });

  test('with value', () => {
    const section = initialSections.getIn(['result', 'children', 'success']);

    const mockCriteria = new Map({
      'statement.result.success': true
    });

    const criterion = renderer
      .create(<Criterion criterion={mockCriteria} section={section} />)
      .toJSON();

    expect(criterion).toMatchSnapshot();
  });

  test('value change', () => {
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
});
