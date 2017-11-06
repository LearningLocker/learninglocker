import { TEST_ORG_ID, TEST_CLIENT_ID } from 'lib/services/auth/tests/utils/constants';

export default (scopes = [], organisation = TEST_ORG_ID, _id = TEST_CLIENT_ID) => ({
  _id,
  organisation,
  api: {
    basic_key: 'key',
    basic_secret: 'secret',
  },
  scopes
});
