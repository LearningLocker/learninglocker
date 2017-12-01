import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { applyMiddleware, createStore } from 'redux';
import { withInsertCSS } from 'ui/utils/hocs';
import { Provider } from 'react-redux';
import { fromJS, Map } from 'immutable';
import thunk from 'redux-thunk';
import { mapValues } from 'lodash';

import PersonasImports from './index';

const PersonasImportsWrapper = withInsertCSS(PersonasImports);

describe('PersonasImports', () => {
  global.__DEVELOPMENT__ = false;
  global.__CLIENT__ = true;
  global.__SERVER__ = false;

  const setupState = (models = {}) => {
    const mockState = {
      auth: fromJS({
        user: {
          userId: 7
        }
      }),
      models: fromJS({
        personasImport: models
      }),
      pagination: {}
    };

    mockState.pagination = new Map().setIn(
      ['personasImport', new Map(), fromJS({ createdAt: -1, _id: -1 }), 'edges'],
      fromJS(mapValues(models, ({ _id }) => ({ id: _id })))
    );

    const mockStore = createStore(
      (data, action) => {
        switch (action.type) {
          case '@@redux/INIT':
            return data;
          default:
            return data;
        }
      },
      mockState,
      applyMiddleware(thunk)
    );

    return mockStore;
  };

  it('should render the personas imports list with no items', () => {
    const mockStore = setupState();

    const personasImports = ReactTestRenderer.create(
      <Provider store={mockStore}>
        <PersonasImportsWrapper />
      </Provider>
    ).toJSON();

    expect(personasImports).toMatchSnapshot();
  });
});
