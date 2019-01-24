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

  describe('when groupType starts with "persona.import."', () => {
    const result = grouper({
      valueType: 'statements',
      groupType: 'persona.import.abcde',
      operatorType: 'uniqueCount'
    });

    test('pipeline has correct stages', () => {
      expect(result.toJS().map(stage => Object.keys(stage)[0]))
        .toEqual([
          '$lookup',
          '$match',
          '$unwind',
          '$match',
          '$project',
          '$group',
          '$sort',
          '$limit',
          '$project'
        ]);
    });

    test('pipeline content is correct', () => {
      expect(result.getIn([0, '$lookup']).toJS())
      .toEqual({
        from: 'personaAttributes',
        as: 'personaAttrs',
        localField: 'person._id',
        foreignField: 'personaId'
      });

      expect(result.getIn([1, '$match']).toJS())
        .toEqual({ 'personaAttrs': { $exists: true } });

      expect(result.getIn([2, '$unwind']).toJS())
        .toEqual({ path: '$personaAttrs' });

      expect(result.getIn([3, '$match']).toJS())
        .toEqual({ 'personaAttrs.key': 'abcde' });

      expect(result.getIn([4, '$project']).toJS())
        .toEqual({
          group: '$personaAttrs.value',
          model: '$personaAttrs.value',
        });
    });
  });
});
