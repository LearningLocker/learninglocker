import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Map } from 'immutable';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunkMiddleware from 'redux-thunk';
import ClientForm from '../ClientForm';
import AuthorityEditor from '../AuthorityEditor';

global.__DEVELOPMENT__ = true;
global.__CLIENT__ = false;
const createMockStore = configureMockStore([thunkMiddleware]);
const store = createMockStore({
  app: new Map({ ENABLE_STATEMENT_DELETION: false }),
  models: new Map(),
  metadata: new Map(),
  pagination: new Map()
});

describe('ClientForm', () => {
  test('ClientForm renders correctly', () => {
    const tree = ReactTestRenderer.create(
      <Provider store={store}>
        <ClientForm model={new Map({ _id: 'testid' })} />
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('AuthorityEditor renders correctly with mbox', () => {
    const authority = new Map({
      mbox: 'mailto:hello@learninglocker.net',
      name: 'test name'
    });
    const tree = ReactTestRenderer.create(
      <Provider store={store}>
        <AuthorityEditor authority={authority} onAuthorityChange={() => { }} />
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('AuthorityEditor renders correctly with account', () => {
    const authority = new Map({
      account: new Map({
        homePage: 'http://learninglocker.net',
        name: 'New Client',
      }),
      name: 'test name'
    });
    const tree = ReactTestRenderer.create(
      <Provider store={store}>
        <AuthorityEditor authority={authority} onAuthorityChange={() => { }} />
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('AuthorityEditor renders correctly with openid', () => {
    const authority = new Map({
      openid: 'http://learninglocker.net/openid/example',
      name: 'test name'
    });
    const tree = ReactTestRenderer.create(
      <Provider store={store}>
        <AuthorityEditor authority={authority} onAuthorityChange={() => { }} />
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('AuthorityEditor renders correctly with mboxsha1sum', () => {
    const mboxSha1SumAuthority = new Map({
      mbox_sha1sum: '53d04bc579b8b4d082ca4a530642845e2c0bfe74',
      name: 'test name'
    });
    const mboxSha1SumTree = ReactTestRenderer.create(
      <Provider store={store}>
        <AuthorityEditor authority={mboxSha1SumAuthority} onAuthorityChange={() => { }} />
      </Provider>
    ).toJSON();
    expect(mboxSha1SumTree).toMatchSnapshot();
  });
});
