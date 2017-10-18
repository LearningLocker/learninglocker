import mongoose from 'mongoose';

import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import {
  EDIT_ALL_VISUALISATIONS,
  EDIT_PUBLIC_VISUALISATIONS
} from 'lib/constants/orgScopes';
import createDashboard from 'api/routes/tests/utils/models/createDashboard';
import createDashboardToken from 'api/routes/tests/utils/tokens/createDashboardToken';
import createClient from 'api/routes/tests/utils/models/createClient';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createUserToken from 'api/routes/tests/utils/tokens/createUserToken';
import createOwnerOrgToken
  from 'api/routes/tests/utils/tokens/createOwnerOrgToken';
import setup from 'api/routes/tests/utils/setup';
import { RESTIFY_PREFIX } from 'lib/constants/routes';
import {
  TEST_USER_ID
} from 'lib/services/auth/tests/utils/constants';
import createVisualisation from '../utils/createVisualisation';


const objectId = mongoose.Types.ObjectId;

describe('API HTTP DELETE visualisations route scope filtering', () => {
  const apiApp = setup();

  const assertVisualisation = async({
    isPublic,
    isOwner,
    bearerToken,
    basicClient,
    expectedStatus = 204
  }) => {
    const visualisation = await createVisualisation(isPublic,
      isOwner ? TEST_USER_ID : objectId());

    const test = apiApp
      .delete(`${RESTIFY_PREFIX}/visualisation/${visualisation._id.toString()}`)
      .set('Content-Type', 'application/json');

    if (bearerToken) {
      test.set('Authorization', `Bearer ${bearerToken}`);
    } else if (basicClient) {
      test.auth(basicClient.api.basic_key, basicClient.api.basic_secret);
    }

    return test.expect(expectedStatus);
  };

  const assertPublicVisualisation = async ({
    bearerToken,
    basicClient,
    expectedStatus = 204
  }) =>
    assertVisualisation({
      isPublic: true,
      isOwner: false,
      bearerToken,
      basicClient,
      expectedStatus
    });

  const assertMyBearerPublicVisualisation = async ({
    token,
    expectedStatus = 204
  }) =>
    assertVisualisation({
      isPublic: true,
      isOwner: true,
      bearerToken: token,
      expectedStatus
    });

  const assertPrivateVisualisation = async ({
    bearerToken,
    basicClient,
    expectedStatus = 204
  }) =>
    assertVisualisation({
      isPublic: false,
      isOwner: false,
      bearerToken,
      basicClient,
      expectedStatus
    });

  const assertMyBearerPrivateVisualisation = async ({
    token,
    expectedStatus = 204
  }) =>
    assertVisualisation({
      isPublic: false,
      isOwner: true,
      bearerToken: token,
      expectedStatus
    });

  it('should delete inside the org when using all scope', async () => {
    const token = await createOrgToken([ALL], [], TEST_USER_ID);
    await assertPublicVisualisation({ bearerToken: token, expectedStatus: 204 });
    await assertPrivateVisualisation({ bearerToken: token, expectedStatus: 204 });
    await assertMyBearerPrivateVisualisation({ token, expectedStatus: 204 });
    await assertMyBearerPublicVisualisation({ token, expectedStatus: 204 });
  });

  it('should delete inside the org when using no scopes', async () => {
    const token = await createOrgToken([], [], TEST_USER_ID);
    await assertPublicVisualisation({ bearerToken: token, expectedStatus: 404 });
    await assertPrivateVisualisation({ bearerToken: token, expectedStatus: 404 });
    await assertMyBearerPublicVisualisation({ token, expectedStatus: 204 });
    await assertMyBearerPrivateVisualisation({ token, expectedStatus: 204 });
  });

  it('should delete inside the org when using edit all scope', async () => {
    const token = await createOrgToken([EDIT_ALL_VISUALISATIONS], [], TEST_USER_ID);
    await assertPublicVisualisation({ bearerToken: token, expectedStatus: 204 });
    await assertPrivateVisualisation({ bearerToken: token, expectedStatus: 204 });
    await assertMyBearerPublicVisualisation({ token, expectedStatus: 204 });
    await assertMyBearerPrivateVisualisation({ token, expectedStatus: 204 });
  });

  it('should delete inside the org when using edit public scope', async () => {
    const token = await createOrgToken([EDIT_PUBLIC_VISUALISATIONS], [], TEST_USER_ID);
    await assertPublicVisualisation({ bearerToken: token, expectedStatus: 204 });
    await assertPrivateVisualisation({ bearerToken: token, expectedStatus: 404 });
    await assertMyBearerPublicVisualisation({ token, expectedStatus: 204 });
    await assertMyBearerPrivateVisualisation({ token, expectedStatus: 204 });
  });

  it('should delete inside the org when using owner org token', async () => {
    const token = await createOwnerOrgToken(TEST_USER_ID);
    await assertPublicVisualisation({ bearerToken: token, expectedStatus: 404 });
    await assertPrivateVisualisation({ bearerToken: token, expectedStatus: 404 });
    await assertMyBearerPublicVisualisation({ token, expectedStatus: 204 });
    await assertMyBearerPrivateVisualisation({ token, expectedStatus: 204 });
  });

  it('should delete inside the org when using site admin token', async () => {
    const token = await createUserToken([SITE_ADMIN], TEST_USER_ID);
    await assertPublicVisualisation({ bearerToken: token, expectedStatus: 204 });
    await assertPrivateVisualisation({ bearerToken: token, expectedStatus: 204 });
    await assertMyBearerPublicVisualisation({ token, expectedStatus: 204 });
    await assertMyBearerPrivateVisualisation({ token, expectedStatus: 204 });
  });

  it('should delete when client basic has the ALL scope', async () => {
    const basicClient = await createClient([ALL]);
    await assertPublicVisualisation({ basicClient, expectedStatus: 204 });
    await assertPrivateVisualisation({ basicClient, expectedStatus: 204 });
  });

  it('should delete when client basic has no scopes', async () => {
    const basicClient = await createClient();
    await assertPublicVisualisation({ basicClient, expectedStatus: 403 });
    await assertPrivateVisualisation({ basicClient, expectedStatus: 403 });
  });

  it('should fail to delete a dashboard using a dashboardToken', async () => {
    const dashboard = await createDashboard({});
    const dashboardToken = await createDashboardToken(dashboard);
    await assertPublicVisualisation({ bearerToken: dashboardToken, expectedStatus: 403 });
    await assertPrivateVisualisation({ bearerToken: dashboardToken, expectedStatus: 403 });
  });
});
