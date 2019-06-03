import {
  TEST_USER_ID,
  TEST_ORG_ID
} from 'lib/services/auth/tests/utils/constants';
import createDummyOrgAuthInfo from 'lib/helpers/createDummyOrgAuthInfo';

const tokenId = TEST_ORG_ID.toString();
const userId = TEST_USER_ID.toString();


export default (scopes) => {
  const authInfo = createDummyOrgAuthInfo(tokenId, scopes);

  return {
    ...authInfo.token,
    userId,
    provider: 'native',
    filter: { test: 1 },
  };
};
