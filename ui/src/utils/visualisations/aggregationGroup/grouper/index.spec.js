import grouper from './index';

test('aggrigationGroup grouper adds unwind pipeline stage', () => {
  const result = grouper({
    valueType: 'statements',
    groupType: 'statement.context.contextActivities.category',
    operatorType: 'uniqueCount'
  });

  expect(result.getIn([1, '$unwind']).toJS())
    .toEqual({ path: '$statement.context.contextActivities.category' });
});

