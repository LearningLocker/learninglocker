import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import {
  VIEW_PUBLIC_DOWNLOADS,
  VIEW_ALL_DOWNLOADS
} from 'lib/constants/orgScopes';
import setup from 'api/routes/tests/utils/setup';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createOwnerOrgToken
  from 'api/routes/tests/utils/tokens/createOwnerOrgToken';
import TEST_ID from 'api/routes/tests/utils/testId';
import OWNER_ID from 'api/routes/tests/utils/ownerId';
import { getCookieName } from 'ui/utils/auth';
import createDownload from './utils/createDownload';

const FAKE_ID = '561a679c0c5d017e40047140';

describe('DownloadController.downloadExport scope filtering', () => {
  const apiApp = setup();

  const downloadExport = async ({
    expectedCode,
    token,
    ownerId = TEST_ID,
    orgId = TEST_ID,
    isPublic = false
  }) => {
    const downloadModel = await createDownload({
      owner: ownerId,
      organisation: orgId,
      isPublic
    });
    const downloadId = downloadModel._id.toString();
    return new Promise((resolve, reject) => {
      const cookieName = getCookieName({ tokenType: 'organisation', tokenId: orgId });
      apiApp
        .get(`/organisation/${orgId}/downloadexport/${downloadId}.csv`)
        .set('Cookie', `${cookieName}=${token}`)
        .expect(expectedCode)
        .end((err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
    });
  };

  const assertNotFound = async ({ token, ownerId, orgId, isPublic }) =>
    downloadExport({
      token,
      expectedCode: 404,
      ownerId,
      orgId,
      isPublic
    });

  const assertAuthorised = async ({ token, ownerId, orgId, isPublic }) =>
    downloadExport({
      token,
      expectedCode: 200,
      ownerId,
      orgId,
      isPublic
    });

  // Tests without scopes.
  it('should not allow action when using no scopes and not owner', async () => {
    const token = await createOrgToken([]);
    await assertNotFound({ token, ownerId: FAKE_ID });
  });

  it('should allow action when using no scopes and owner', async () => {
    const token = await createOrgToken([]);
    await assertAuthorised({ token });
  });

  it('should not allow action when using no scopes and is public', async () => {
    const token = await createOrgToken([]);
    await assertNotFound({ token, ownerId: FAKE_ID, isPublic: true });
  });

  it('should not allow action when using no scopes and is outside org', async () => {
    const token = await createOrgToken([]);
    await assertNotFound({ token, orgId: FAKE_ID });
  });

  // Tests for ALL scope.
  it('should allow action when using ALL scope and not owner', async () => {
    const token = await createOrgToken([ALL]);
    await assertAuthorised({ token, ownerId: FAKE_ID });
  });

  it('should allow action when using ALL scope and is owner', async () => {
    const token = await createOrgToken([ALL]);
    await assertAuthorised({ token });
  });

  it('should allow action when using ALL scope and is public', async () => {
    const token = await createOrgToken([ALL]);
    await assertAuthorised({ token, ownerId: FAKE_ID, isPublic: true });
  });

  it('should not allow action when using ALL scope and is outside org', async () => {
    const token = await createOrgToken([ALL]);
    await assertNotFound({ token, orgId: FAKE_ID });
  });

  // Tests for VIEW_ALL_DOWNLOADS scope.
  it('should allow action when using VIEW_ALL_DOWNLOADS scope and not owner', async () => {
    const token = await createOrgToken([VIEW_ALL_DOWNLOADS]);
    await assertAuthorised({ token, ownerId: FAKE_ID });
  });

  it('should allow action when using VIEW_ALL_DOWNLOADS scope and is owner', async () => {
    const token = await createOrgToken([VIEW_ALL_DOWNLOADS]);
    await assertAuthorised({ token });
  });

  it('should allow action when using VIEW_ALL_DOWNLOADS scope and is public', async () => {
    const token = await createOrgToken([VIEW_ALL_DOWNLOADS]);
    await assertAuthorised({ token, ownerId: FAKE_ID, isPublic: true });
  });

  it('should not allow action when using VIEW_ALL_DOWNLOADS scope and is outside org', async () => {
    const token = await createOrgToken([VIEW_ALL_DOWNLOADS]);
    await assertNotFound({ token, orgId: FAKE_ID });
  });

  // Tests for VIEW_PUBLIC_DOWNLOADS scope.
  it('should not allow action when using VIEW_PUBLIC_DOWNLOADS scope and not owner', async () => {
    const token = await createOrgToken([VIEW_PUBLIC_DOWNLOADS]);
    await assertNotFound({ token, ownerId: FAKE_ID });
  });

  it('should allow action when using VIEW_PUBLIC_DOWNLOADS scope and is owner', async () => {
    const token = await createOrgToken([VIEW_PUBLIC_DOWNLOADS]);
    await assertAuthorised({ token });
  });

  it('should allow action when using VIEW_PUBLIC_DOWNLOADS scope and is public', async () => {
    const token = await createOrgToken([VIEW_PUBLIC_DOWNLOADS]);
    await assertAuthorised({ token, ownerId: FAKE_ID, isPublic: true });
  });

  it('should not allow action when using VIEW_PUBLIC_DOWNLOADS scope and is outside org', async () => {
    const token = await createOrgToken([VIEW_PUBLIC_DOWNLOADS]);
    await assertNotFound({ token, orgId: FAKE_ID });
  });

  // Tests for owner.
  it('should not allow action when org owner and not owner', async () => {
    const token = await createOwnerOrgToken();
    await assertNotFound({ token, ownerId: FAKE_ID });
  });

  it('should allow action when org owner and is owner', async () => {
    const token = await createOwnerOrgToken();
    await assertAuthorised({ token, ownerId: OWNER_ID });
  });

  it('should not allow action when org owner and is public', async () => {
    const token = await createOwnerOrgToken();
    await assertNotFound({ token, ownerId: FAKE_ID, isPublic: true });
  });

  it('should not allow action when org owner and is outside org', async () => {
    const token = await createOwnerOrgToken();
    await assertNotFound({ token, orgId: FAKE_ID });
  });

  // Tests for site admin.
  it('should allow action when site admin and not owner', async () => {
    const token = await createOrgToken([], [SITE_ADMIN]);
    await assertAuthorised({ token, ownerId: FAKE_ID });
  });

  it('should allow action when site admin and is owner', async () => {
    const token = await createOrgToken([], [SITE_ADMIN]);
    await assertAuthorised({ token, ownerId: OWNER_ID });
  });

  it('should allow action when site admin and is public', async () => {
    const token = await createOrgToken([], [SITE_ADMIN]);
    await assertAuthorised({ token, ownerId: FAKE_ID, isPublic: true });
  });

  it('should not allow action when site admin and is outside org', async () => {
    const token = await createOrgToken([], [SITE_ADMIN]);
    await assertNotFound({ token, orgId: FAKE_ID });
  });
});
