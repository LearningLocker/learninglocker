import { fromJS } from 'immutable';
import BaseAxesEditor from './BaseAxesEditor';

test('shouldComponentUpdate true', () => {
  const component = new BaseAxesEditor({
    model: fromJS({
      axesxValue: 1234
    })
  });

  const nextProp = {
    model: fromJS({
      axesxValue: 5432
    })
  };

  const result = component.shouldComponentUpdate(nextProp);

  expect(result).toEqual(true);
});

test('shouldComponentUpdate false', () => {
  const component = new BaseAxesEditor({
    model: fromJS({
      axesxValue: 1234
    })
  });

  const nextProp = {
    model: fromJS({
      axesxValue: 1234
    })
  };

  const result = component.shouldComponentUpdate(nextProp);

  expect(result).toEqual(false);
});

test('changeAxes', () => {
  const updateModelFn = jest.fn();

  const component = new BaseAxesEditor({
    model: fromJS({
      _id: 777
    }),
    updateModel: updateModelFn
  });

  component.changeAxes('xValue', 31);

  expect(updateModelFn.mock.calls.length).toEqual(1);
  expect(updateModelFn.mock.calls[0][0].schema).toEqual('visualisation');
  expect(updateModelFn.mock.calls[0][0].id).toEqual(777);
  expect(updateModelFn.mock.calls[0][0].path).toEqual('axesxValue');
  expect(updateModelFn.mock.calls[0][0].value).toEqual(31);
});

test('getAxesValue', () => {
  const component = new BaseAxesEditor({
    model: fromJS({
      axesxValue: 1234
    })
  });

  const result = component.getAxesValue('xValue');

  expect(result).toEqual(1234);
});
