import grouper from './index';

describe('aggregationGroup grouper', () => {
  describe('when groupType is "date"', () => {
    const result = grouper({
      valueType: 'statements',
      groupType: 'date',
      operatorType: 'uniqueCount'
    });

    test('pipeline has correct stages', () => {
      expect(result.toJS().map(stage => Object.keys(stage)[0]))
        .toEqual([
          '$project',
          '$group',
          '$sort',
          '$limit',
          '$project'
        ]);
    });
  });

  describe('when groupType starts with "statement.context.contextActivities."', () => {
    const result = grouper({
      valueType: 'statements',
      groupType: 'statement.context.contextActivities.category',
      operatorType: 'uniqueCount'
    });

    test('pipeline has correct unwind stage', () => {
      expect(result.getIn([1, '$unwind']).toJS())
        .toEqual({ path: '$statement.context.contextActivities.category' });
    });
  });
});
