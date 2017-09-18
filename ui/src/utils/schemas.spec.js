import { fromJS } from 'immutable';
import { visualisation } from './schemas';

test('preSave should strinify some axes objects', () => {
  const mockModel = fromJS({
    axesxValue: {
      value: 99
    },
    axesxOperator: 'testOperator'
  });

  const result = visualisation.preSave(mockModel);
  expect(result.get('axesxValue')).toEqual(JSON.stringify({ value: 99 }));
  expect(result.get('axesxOperator')).toEqual('testOperator');
});

test('reviver should not json parse axesxOperator', () => {
  const result = visualisation.reviver('axesxOperator', fromJS({
    axesxOperator: 'testOperator'
  }));

  expect(result.get('axesxOperator')).toEqual('testOperator');
});

test('reviver should jsan parse axesxValue', () => {
  const result = visualisation.reviver('axesxValue', fromJS({
    axesxValue: JSON.stringify({ value: 99 })
  }));

  expect(result.get('axesxValue').get('value')).toEqual(99);
});
