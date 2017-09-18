import { fromJS } from 'immutable';
import { initialSections } from './queryBuilder';

test('Objects.getQueryModel should map statement.object.id', () => {
  const model = fromJS({
    value: {
      id: '42',
      key: 'statement.object.id',
      object: {
        'statement.object.id': '42'
      }
    }
  });

  const getModelQuery = initialSections.getIn(['objects', 'getModelQuery']);
  const result = getModelQuery(model);

  expect(result.get('statement.object.id')).toEqual('42');
});
