import React from 'react';
import { withInsertCSS } from 'ui/utils/hocs';
import ReactTestRenderer from 'react-test-renderer';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { List } from 'immutable';
import SaveBarErrors from './index';

const SaveBarErrorsWrapper = withInsertCSS(SaveBarErrors);

const createMockStore = () => {
  const mockState = {
    alerts: new List([{
      message: 'Hello World'
    }])
  };

  const mockStore = createStore(
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

  return mockStore;
};

describe('SaveBarErrors', () => {
  it('should render an error message', () => {
    const mockStore = createMockStore();

    const errors = ReactTestRenderer.create(
      <Provider store={mockStore}>
        <SaveBarErrorsWrapper />
      </Provider>
    ).toJSON();

    expect(errors).toMatchSnapshot();
  });
});
