import * as routes from 'lib/constants/routes';
import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import { MANAGE_ALL_PERSONAS } from 'lib/constants/orgScopes';
import setup from 'api/routes/tests/utils/setup';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createOwnerOrgToken from 'api/routes/tests/utils/tokens/createOwnerOrgToken';
import testId from 'api/routes/tests/utils/testId';
import { STAGE_UPLOAD } from 'lib/constants/personasImport';
import PersonasImport from 'lib/models/personasImport';
import { toString } from 'lodash';

const TEST_FILE = `${process.cwd()}/api/src/routes/tests/fixtures/people.csv`;

describe('UploadController.uploadPeople scope filtering', () => {
  const apiApp = setup();

  const uploadPeople = async ({ expectedCode, token }) => {
    const personaImport = await PersonasImport.create({
      title: 'test',
      organisation: testId,
      importStage: STAGE_UPLOAD
    });

    await apiApp
      .post(routes.UPLOADPERSONAS)
      .set('Authorization', `Bearer ${token}`)
      .field('id', toString(personaImport._id))
      .attach('csv', TEST_FILE)
      .expect(expectedCode);
  };

  const assertUnauthorised = async token =>
    uploadPeople({
      token,
      expectedCode: 403
    });

  const assertAuthorised = async token =>
    uploadPeople({
      token,
      expectedCode: 200
    });

  it('should not allow action when no scopes are used', async () => {
    const token = await createOrgToken([]);
    await assertUnauthorised(token);
  });

  it('should allow action when ALL org scope is used', async () => {
    const token = await createOrgToken([ALL]);
    await assertAuthorised(token);
  });

  it('should allow action when MANAGE_ALL_PERSONAS org scope is used', async () => {
    const token = await createOrgToken([MANAGE_ALL_PERSONAS]);
    await assertAuthorised(token);
  });

  it('should not allow action when owner token is used', async () => {
    const token = await createOwnerOrgToken();
    await assertUnauthorised(token);
  });

  it('should allow action when SITE_ADMIN site scope is used', async () => {
    const token = await createOrgToken([], [SITE_ADMIN]);
    await assertAuthorised(token);
  });
});
