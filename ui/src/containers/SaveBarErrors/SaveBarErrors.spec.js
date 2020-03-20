import React from 'react';
import 'jest-styled-components';
import renderer from 'react-test-renderer';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { List } from 'immutable';
import SaveBarErrors from './index';

const createMockStore = () => {
  const mockState = {
    alerts: new List([{
      message: 'Hello World'
    }])
  };

  return createStore(
    (data, action) => {
      switch (action.type) {
        case '@@redux/INIT':
          return data;
        default:
          return;
      }
    },
    mockState
  );
};

describe('SaveBarErrors', () => {
  it('should render an error message', () => {
    const mockStore = createMockStore();

    const errors = renderer
      .create(
        <Provider store={mockStore}>
          <SaveBarErrors />
        </Provider>
      )
      .toJSON();

    expect(errors).toMatchSnapshot();
  });
});
