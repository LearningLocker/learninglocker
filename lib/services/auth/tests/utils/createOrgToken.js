import {
  TEST_USER_ID,
  TEST_ORG_ID
} from 'lib/services/auth/tests/utils/constants';

const tokenId = TEST_ORG_ID.toString();
const userId = TEST_USER_ID.toString();

export default scopes => ({
  tokenId,
  tokenType: 'organisation',
  userId,
  provider: 'native',
  filter: { test: 1 },
  scopes
});
