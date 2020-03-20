import { fromJS } from 'immutable';
import { buttonFilter } from './index';

test('If multiple models, show buttons', () => {
  const mockButtons = ['DeleteButton'];
  const mockModels = fromJS(['model1', 'model2']);

  const result = buttonFilter(mockButtons, mockModels);

  expect(result.length).toEqual(1);
});

test('If one model, show no buttons', () => {
  const mockButtons = ['DeleteButton'];
  const mockModels = fromJS(['model1']);

  const result = buttonFilter(mockButtons, mockModels);

  expect(result.length).toEqual(0);
});
