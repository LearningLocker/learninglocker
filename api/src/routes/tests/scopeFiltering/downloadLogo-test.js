import * as routes from 'lib/constants/routes';
import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import { MANAGE_ALL_ORGANISATIONS } from 'lib/constants/orgScopes';
import setup from 'api/routes/tests/utils/setup';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createOwnerOrgToken
  from 'api/routes/tests/utils/tokens/createOwnerOrgToken';
import createUserToken from 'api/routes/tests/utils/tokens/createUserToken';
import testId from 'api/routes/tests/utils/testId';
import masterId from 'api/routes/tests/utils/masterId';

const TEST_FILE = `${process.cwd()}/api/src/routes/tests/fixtures/favicon.png`;

describe('DownloadController.downloadLogo scope filtering', () => {
  const apiApp = setup();

  const createMasterToken = async () => createOrgToken([ALL], [], masterId);

  const uploadLogo = async () => {
    const orgId = testId;
    const token = await createMasterToken();
    return new Promise((resolve, reject) => {
      apiApp
        .post(routes.UPLOADLOGO)
        .set('Authorization', `Bearer ${token}`)
        .attach('logo', TEST_FILE)
        .query({ data: orgId })
        .expect(200)
        .end((err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
    });
  };

  const downloadLogo = async ({ expectedCode, token }) => {
    const orgId = testId;
    await uploadLogo();
    return new Promise((resolve, reject) => {
      apiApp
        .get(`/downloadlogo/${orgId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(expectedCode)
        .end((err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
    });
  };

  const assertAuthorised = token =>
    downloadLogo({
      token,
      expectedCode: 200
    });

  it('should not allow action when no scopes are used', async () => {
    const token = await createOrgToken([]);
    await assertAuthorised(token);
  });

  it('should allow action when ALL org scope is used', async () => {
    const token = await createOrgToken([ALL]);
    await assertAuthorised(token);
  });

  it('should allow action when MANAGE_ALL_ORGANISATIONS org scope is used', async () => {
    const token = await createOrgToken([MANAGE_ALL_ORGANISATIONS]);
    await assertAuthorised(token);
  });

  it('should allow action when owner token is used', async () => {
    const token = await createOwnerOrgToken();
    await assertAuthorised(token);
  });

  it('should allow action when SITE_ADMIN site scope is used', async () => {
    const token = await createOrgToken([], [SITE_ADMIN]);
    await assertAuthorised(token);
  });

  it('should not allow action when user token with no scopes is used', async () => {
    const token = await createUserToken([], '561a679c0c5d017e4004714c');
    await assertAuthorised(token);
  });

  it('should allow action when user token with SITE_ADMIN scope is used', async () => {
    const token = await createUserToken(
      [SITE_ADMIN],
      '561a679c0c5d017e4004714c'
    );
    await assertAuthorised(token);
  });
});
