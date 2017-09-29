import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { withInsertCSS } from 'ui/utils/hocs';
import { fromJS, List } from 'immutable';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import SaveBar, { savingSelector } from './index.js';

const SaveBarWrapper = withInsertCSS(SaveBar);

const createMockStore = ({
  requestState = IN_PROGRESS
}) => {
  const mockState = {
    models: fromJS({
      modelType: {
        theModelId: {
          remoteCache: {
            requestState
          }
        }
      }
    }),
    alerts: new List()
  };

  const mockStore =
    createStore((data, action) => {
      switch (action.type) {
        case '@@redux/INIT':
          return data;
        case 'addModel':
          data.models = data.models.setIn(['modelType', action.modelId], fromJS(action.model));
          return data;
        default:
          return;
      }
    }, mockState);

  return mockStore;
};

describe('SaveBar', () => {
  it('should render save bar IN_PROGRESS', () => {
    const mockStore = createMockStore({ requestState: IN_PROGRESS });

    const sideNav = ReactTestRenderer.create(
      <Provider store={mockStore}>
        <SaveBarWrapper />
      </Provider>
    ).toJSON();

    expect(sideNav).toMatchSnapshot();
  });

  it('should render save bar COMPLETED', () => {
    const mockStore = createMockStore({ requestState: COMPLETED });

    const sideNav = ReactTestRenderer.create(
      <Provider store={mockStore}>
        <SaveBarWrapper />
      </Provider>
      ).toJSON();

    expect(sideNav).toMatchSnapshot();
  });

  it('should render save bar FAILED', () => {
    const mockStore = createMockStore({ requestState: FAILED });

    const sideNav = ReactTestRenderer.create(
      <Provider store={mockStore}>
        <SaveBarWrapper />
      </Provider>
    ).toJSON();

    expect(sideNav).toMatchSnapshot();
  });

  it('reducer should be in progress', () => {
    const mockStore = createMockStore({});

    mockStore.dispatch({
      type: 'addModel',
      modelId: '123',
      model: {
        requestState: FAILED
      }
    });

    mockStore.dispatch({
      type: 'addModel',
      modelId: '456',
      model: {
        requestState: COMPLETED
      }
    });

    const result = savingSelector()(mockStore.getState());

    expect(result).toEqual(IN_PROGRESS);
  });

  it('reducer should be false', () => {
    const mockStore = createMockStore({ requestState: null });

    const result = savingSelector()(mockStore.getState());

    expect(result).toEqual(false);
  });
});
