import { fromJS } from 'immutable';
import { loggedInUserId } from './index.js';

test('loggedInUserId should extract the user id from the organisation', () => {
  const mockState = {
    auth: fromJS({
      activeTokenId: 'theTokenId',
      activeTokenType: 'organisation',
      tokens: {
        organisation: {
          theTokenId: {
            userId: 'theUserId'
          }
        }
      }
    })
  };

  const result = loggedInUserId(mockState);

  expect(result).toEqual('theUserId');
});

test('loggedInUserId should extract the user from user type', () => {
  const mockState = {
    auth: fromJS({
      tokens: {
        user: {
          userId: 'theUserId'
        }
      }
    })
  };

  const result = loggedInUserId(mockState);

  expect(result).toEqual('theUserId');
});
