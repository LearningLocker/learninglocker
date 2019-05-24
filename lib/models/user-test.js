import mongoose from 'mongoose';
import { expect } from 'chai';
import { TEST_ID } from 'api/routes/tests/utils/testId';
import {
  TEST_ORG_ID,
  TEST_OWNER_ID
} from 'lib/services/auth/tests/utils/constants';
import createUser from 'lib/services/auth/tests/utils/createUser';
import { ALL } from 'lib/constants/scopes';
import { MANAGE_ALL_USERS } from 'lib/constants/orgScopes';
import { set, unset } from 'lodash';
import User from './user';

const objectId = mongoose.Types.ObjectId;

describe.only('user model', () => {
  let mockRequest;
  let responseCalled;
  
  const mockResponse = {
    status: () => {
      responseCalled = true;
      return {
        send: () => {}
      }
    }
  };

  beforeEach(() => {
    responseCalled = false;

    mockRequest = {
      user: {
        authInfo: {
          user: {
            _id: objectId(TEST_OWNER_ID)
          },
          client: {
            scopes: []
          }
        },
      },
      params: {
        id: objectId(TEST_OWNER_ID)
      },
      body: {
        name: 'dave',
        scopes: [ALL],
        password: 'password0',
        organisationSettings: [{
          samlEnabled: true,
          scopes: [ ALL ],
          roles: [ ALL ],
          filter: '{}'
        }]
      }
    };
  })

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should allow a user to only change their name and samlEnabled', async () => {
    let responseCalled = false;
    const mockResponse = {
      status: () => {
        responseCalled = true;
        return {
          send: () => {}
        }
      }
    }

    const user = createUser(TEST_OWNER_ID);

    User.writeScopeChecks.bind(user)(mockRequest, mockResponse, () => {});

    expect(responseCalled).to.equal(true);
    expect(mockRequest.body.name).to.equal('dave');
    expect(mockRequest.body.scopes).to.equal(undefined);
    expect(mockRequest.body.organisationSettings[0].scopes).to.equal(undefined);
    expect(mockRequest.body.organisationSettings[0].roles).to.equal(undefined);
    expect(mockRequest.body.organisationSettings[0].filter).to.equal(undefined);
    expect(mockRequest.body.organisationSettings[0].samlEnabled).to.equal(true);
  });

  it(
    'should allow a user to only change their name and samlEnabled even if they have MANAGE_ALL_USERS scope',
    async () => {
      set(mockRequest, ['user', 'authInfo', 'client', 'scopes'], [ MANAGE_ALL_USERS ]);
      let responseCalled = false;
      const mockResponse = {
        status: () => {
          responseCalled = true;
          return {
            send: () => {}
          }
        }
      }

      const user = createUser(TEST_OWNER_ID);

      User.writeScopeChecks.bind(user)(mockRequest, mockResponse, () => {});

      expect(responseCalled).to.equal(true);
      expect(mockRequest.body.name).to.equal('dave');
      expect(mockRequest.body.scopes).to.equal(undefined);
      expect(mockRequest.body.organisationSettings[0].scopes).to.equal(undefined);
      expect(mockRequest.body.organisationSettings[0].roles).to.equal(undefined);
      expect(mockRequest.body.organisationSettings[0].filter).to.equal(undefined);
      expect(mockRequest.body.organisationSettings[0].samlEnabled).to.equal(true);
    }
  );

  it('should allow MANAGE_ALL_USERS to change other users organisationSettings filter roles and scope but not password', () => {
    set(mockRequest, ['user', 'authInfo', 'user', '_id'], TEST_ID);
    set(mockRequest, ['user', 'authInfo', 'client', 'scopes'], [ MANAGE_ALL_USERS ]);

    const user = createUser(TEST_OWNER_ID);
    User.writeScopeChecks.bind(user)(mockRequest, mockResponse, () => {});

    expect(responseCalled).to.equal(true);
    expect(mockRequest.body.name).to.equal('dave');
    expect(mockRequest.body.password).to.equal(undefined);
    expect(mockRequest.body.scopes).to.deep.equal(undefined);
    expect(mockRequest.body.organisationSettings[0].scopes).to.deep.equal([ ALL ]);
    expect(mockRequest.body.organisationSettings[0].roles).to.deep.equal([ ALL ]);
    expect(mockRequest.body.organisationSettings[0].filter).to.equal('{}');
  });

  it('should allow a client to change everything', () => {
    unset(mockRequest, ['user', 'authInfo', 'user']);
    set(mockRequest, ['user', 'authInfo', 'client'], {});

    const user = createUser(TEST_OWNER_ID);

    User.writeScopeChecks.bind(user)(mockRequest, mockResponse, () => {});

    expect(responseCalled).to.equal(true);
    expect(mockRequest.body.scopes).to.deep.equal([ ALL ]);
    expect(mockRequest.body.organisationSettings[0].scopes).to.deep.equal([ ALL ]);
    expect(mockRequest.body.organisationSettings[0].roles).to.deep.equal([ ALL ]);
    expect(mockRequest.body.organisationSettings[0].filter).to.equal('{}');
  });
});
