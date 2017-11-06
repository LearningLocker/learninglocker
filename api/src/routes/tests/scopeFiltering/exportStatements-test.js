import * as routes from 'lib/constants/routes';
import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import { VIEW_PUBLIC_EXPORTS, VIEW_ALL_EXPORTS } from 'lib/constants/orgScopes';
import setup from 'api/routes/tests/utils/setup';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createOwnerOrgToken
  from 'api/routes/tests/utils/tokens/createOwnerOrgToken';
import TEST_ID from 'api/routes/tests/utils/testId';
import OWNER_ID from 'api/routes/tests/utils/ownerId';
import createExport from './utils/createExport';

const FAKE_ID = '561a679c0c5d017e40047140';

describe('ExportController.exportStatements scope filtering', () => {
  const apiApp = setup();

  const exportStatements = async ({
    expectedCode,
    token,
    ownerId = TEST_ID,
    orgId = TEST_ID,
    isPublic = false
  }) => {
    const exportModel = await createExport({
      owner: ownerId,
      organisation: orgId,
      isPublic
    });
    const exportId = exportModel._id.toString();
    const pipelines = JSON.stringify([]);
    return new Promise((resolve, reject) => {
      apiApp
        .get(routes.EXPORT)
        .set('Authorization', `Bearer ${token}`)
        .query({ exportId, pipelines })
        .expect(expectedCode)
        .end((err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
    });
  };

  const assertNotFound = async ({ token, ownerId, orgId, isPublic }) =>
    exportStatements({
      token,
      expectedCode: 404,
      ownerId,
      orgId,
      isPublic
    });

  const assertAuthorised = async ({ token, ownerId, orgId, isPublic }) =>
    exportStatements({
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

  it('should allow action when using no scopes and is owner', async () => {
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

  // Tests for VIEW_ALL_EXPORTS scope.
  it('should allow action when using VIEW_ALL_EXPORTS scope and not owner', async () => {
    const token = await createOrgToken([VIEW_ALL_EXPORTS]);
    await assertAuthorised({ token, ownerId: FAKE_ID });
  });

  it('should allow action when using VIEW_ALL_EXPORTS scope and is owner', async () => {
    const token = await createOrgToken([VIEW_ALL_EXPORTS]);
    await assertAuthorised({ token });
  });

  it('should allow action when using VIEW_ALL_EXPORTS scope and is public', async () => {
    const token = await createOrgToken([VIEW_ALL_EXPORTS]);
    await assertAuthorised({ token, ownerId: FAKE_ID, isPublic: true });
  });

  it('should not allow action when using VIEW_ALL_EXPORTS scope and is outside org', async () => {
    const token = await createOrgToken([VIEW_ALL_EXPORTS]);
    await assertNotFound({ token, orgId: FAKE_ID });
  });

  // Tests for VIEW_PUBLIC_EXPORTS scope.
  it('should not allow action when using VIEW_PUBLIC_EXPORTS scope and not owner', async () => {
    const token = await createOrgToken([VIEW_PUBLIC_EXPORTS]);
    await assertNotFound({ token, ownerId: FAKE_ID });
  });

  it('should allow action when using VIEW_PUBLIC_EXPORTS scope and is owner', async () => {
    const token = await createOrgToken([VIEW_PUBLIC_EXPORTS]);
    await assertAuthorised({ token });
  });

  it('should allow action when using VIEW_PUBLIC_EXPORTS scope and is public', async () => {
    const token = await createOrgToken([VIEW_PUBLIC_EXPORTS]);
    await assertAuthorised({ token, ownerId: FAKE_ID, isPublic: true });
  });

  it('should not allow action when using VIEW_PUBLIC_EXPORTS scope and is outside org', async () => {
    const token = await createOrgToken([VIEW_PUBLIC_EXPORTS]);
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
