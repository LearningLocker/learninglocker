import { Map, List } from 'immutable';
import { initialSections } from 'ui/redux/modules/queryBuilder';
import Criteria from './Criteria';

test('It should generate initial Criterion', () => {
  const testCriteria = new Criteria({
    criteria: new Map(),
    section: initialSections.getIn(['result', 'children', 'scaled'])
  });
  testCriteria.renderCriterion = jest.fn();

  testCriteria.renderCriteria();

  expect(testCriteria.renderCriterion.mock.calls.length).toEqual(1);
  expect(testCriteria.renderCriterion.mock.calls[0][0].get('statement.result.score.scaled')).toEqual(new Map({ $gt: '' }));
  expect(testCriteria.renderCriterion.mock.calls[0][1])
    .toEqual(new Map({
      criterionLabel: 'A',
      criteriaPath: new List(['statement', 'result', 'score', 'scaled'])
    }).toString());
});
