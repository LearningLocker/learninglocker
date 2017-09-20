import { TEST_ORG_ID, TEST_OWNER_ID } from 'lib/services/auth/tests/utils/constants';
import Organisation from 'lib/models/organisation';
import 'lib/models/user';
import 'lib/models/role';

export default () => {
  before(async () => {
    await Organisation.create({
      _id: TEST_ORG_ID,
      owner: TEST_OWNER_ID,
    });
  });

  after(async () => {
    await Organisation.remove({
      _id: TEST_ORG_ID,
    });
  });
};
