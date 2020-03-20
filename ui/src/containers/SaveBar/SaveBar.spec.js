import React from 'react';
import renderer from 'react-test-renderer';
import { fromJS, List } from 'immutable';
import { COMPLETED, FAILED, IN_PROGRESS } from 'ui/utils/constants';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import SaveBar, { savingSelector } from './index.js';

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
    uploadPersonas: fromJS({}),
    mergePersona: fromJS({}),
    alerts: new List(),
    userOrganisationSettings: {},
  };

  return createStore((data, action) => {
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
};

describe('SaveBar', () => {
  it('should render save bar IN_PROGRESS', () => {
    const mockStore = createMockStore({ requestState: IN_PROGRESS });

    const sideNav = renderer
      .create(
        <Provider store={mockStore}>
          <SaveBar />
        </Provider>
      )
      .toJSON();

    expect(sideNav).toMatchSnapshot();
  });

  it('should render save bar COMPLETED', () => {
    const mockStore = createMockStore({ requestState: COMPLETED });

    const sideNav = renderer
      .create(
        <Provider store={mockStore}>
          <SaveBar />
        </Provider>
      )
      .toJSON();

    expect(sideNav).toMatchSnapshot();
  });

  it('should render save bar FAILED', () => {
    const mockStore = createMockStore({ requestState: FAILED });

    const sideNav = renderer
      .create(
        <Provider store={mockStore}>
          <SaveBar />
        </Provider>
      )
      .toJSON();

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
